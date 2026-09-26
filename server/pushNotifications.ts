import type { Express, Response } from 'express';
import http2 from 'node:http2';
import crypto from 'node:crypto';
import { z } from 'zod';
import { isAuthenticated, supabaseAdmin } from './supabaseAuth';

// Xcode debug builds get sandbox tokens and TestFlight/App Store builds get production tokens,
// and the token itself doesn't say which, so production is tried first and sandbox second.
const APNS_HOSTS = ['https://api.push.apple.com', 'https://api.sandbox.push.apple.com'] as const;
// Apple rejects provider tokens older than an hour and throttles ones refreshed more than every 20 minutes.
const PROVIDER_TOKEN_TTL_MS = 50 * 60 * 1000;

type ApnsConfig = { keyId: string; teamId: string; privateKey: string; bundleId: string };
type SendResult = { status: number; reason?: string };
export type PushMessage = { title: string; body: string; data?: Record<string, string> };

let warnedMissingConfig = false;
let providerToken: { value: string; issuedAt: number } | null = null;

function apnsConfig(): ApnsConfig | null {
  const keyId = process.env.APNS_KEY_ID?.trim();
  const teamId = process.env.APNS_TEAM_ID?.trim();
  // Railway variables can't hold real newlines reliably, so "\n" escapes are accepted too.
  const privateKey = process.env.APNS_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  if (!keyId || !teamId || !privateKey) {
    if (!warnedMissingConfig) {
      console.warn('Push notifications disabled: set APNS_KEY_ID, APNS_TEAM_ID and APNS_PRIVATE_KEY.');
      warnedMissingConfig = true;
    }
    return null;
  }
  return { keyId, teamId, privateKey, bundleId: process.env.APNS_BUNDLE_ID?.trim() || 'com.bytewise.nutritionist' };
}

function getProviderToken(config: ApnsConfig): string {
  if (providerToken && Date.now() - providerToken.issuedAt < PROVIDER_TOKEN_TTL_MS) {
    return providerToken.value;
  }
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const issuedAt = Date.now();
  const unsigned = `${encode({ alg: 'ES256', kid: config.keyId })}.${encode({ iss: config.teamId, iat: Math.floor(issuedAt / 1000) })}`;
  const signature = crypto.sign('sha256', Buffer.from(unsigned), { key: config.privateKey, dsaEncoding: 'ieee-p1363' });
  providerToken = { value: `${unsigned}.${signature.toString('base64url')}`, issuedAt };
  return providerToken.value;
}

function sendToApns(host: string, deviceToken: string, payload: object, config: ApnsConfig): Promise<SendResult> {
  return new Promise(resolve => {
    const session = http2.connect(host);
    let settled = false;
    const finish = (result: SendResult) => {
      if (settled) return;
      settled = true;
      session.close();
      resolve(result);
    };
    session.on('error', error => finish({ status: 0, reason: error.message }));

    const request = session.request({
      ':method': 'POST',
      ':path': `/3/device/${deviceToken}`,
      authorization: `bearer ${getProviderToken(config)}`,
      'apns-topic': config.bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'content-type': 'application/json',
    });
    let status = 0;
    let body = '';
    request.setEncoding('utf8');
    request.setTimeout(10_000, () => {
      request.close();
      finish({ status: 0, reason: 'timeout' });
    });
    request.on('response', headers => { status = Number(headers[':status']) || 0; });
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      let reason: string | undefined;
      try { reason = body ? JSON.parse(body).reason : undefined; } catch { reason = body || undefined; }
      finish({ status, reason });
    });
    request.on('error', error => finish({ status: 0, reason: error.message }));
    request.end(JSON.stringify(payload));
  });
}

async function deliver(deviceToken: string, payload: object, config: ApnsConfig): Promise<'sent' | 'invalid' | 'failed'> {
  let last: SendResult = { status: 0 };
  for (const host of APNS_HOSTS) {
    last = await sendToApns(host, deviceToken, payload, config);
    if (last.status === 200) return 'sent';
    if (last.status === 410) return 'invalid';
    if (last.reason !== 'BadDeviceToken') break;
  }
  if (last.reason === 'BadDeviceToken') return 'invalid';
  console.warn(`APNs push failed (${last.status}): ${last.reason || 'unknown error'}`);
  return 'failed';
}

/** Sends an alert to every iOS device the user has registered. Never throws. */
export async function sendPushToUser(userId: string, message: PushMessage): Promise<void> {
  try {
    const config = apnsConfig();
    if (!config) return;

    const { data, error } = await supabaseAdmin.from('push_tokens').select('token').eq('user_id', userId);
    if (error) throw error;
    if (!data?.length) return;

    const payload = {
      aps: { alert: { title: message.title, body: message.body }, sound: 'default' },
      ...message.data,
    };
    const results = await Promise.all(data.map(async ({ token }: { token: string }) => ({
      token,
      outcome: await deliver(token, payload, config),
    })));

    const invalid = results.filter(r => r.outcome === 'invalid').map(r => r.token);
    if (invalid.length) {
      await supabaseAdmin.from('push_tokens').delete().in('token', invalid);
    }
  } catch (error: any) {
    console.warn('Could not send push notification:', error?.message || error);
  }
}

const tokenSchema = z.object({
  token: z.string().trim().regex(/^[0-9a-fA-F]{64,200}$/, 'Invalid device token'),
});

export function registerPushRoutes(app: Express) {
  app.post('/api/push/register', isAuthenticated, async (req: any, res: Response) => {
    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid device token' });

    try {
      // A device that switches accounts keeps its token, so the row moves to the new user.
      const { error } = await supabaseAdmin.from('push_tokens').upsert({
        token: parsed.data.token.toLowerCase(),
        user_id: req.user.id,
        platform: 'ios',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'token' });
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Failed to register push token:', error?.message || error);
      res.status(500).json({ message: 'Failed to register device' });
    }
  });

  app.post('/api/push/unregister', isAuthenticated, async (req: any, res: Response) => {
    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid device token' });

    try {
      const { error } = await supabaseAdmin
        .from('push_tokens')
        .delete()
        .eq('token', parsed.data.token.toLowerCase())
        .eq('user_id', req.user.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Failed to unregister push token:', error?.message || error);
      res.status(500).json({ message: 'Failed to unregister device' });
    }
  });
}
