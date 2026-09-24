import type { Express, Response } from "express";
import { z } from "zod";
import { isAuthenticated, supabaseAdmin } from "./supabaseAuth";

// Uses the Supabase admin client rather than the direct Postgres pool: in production the pool can be
// unreachable while the REST API works, and the rest of storage.ts already falls back to it.

type Profile = { id: string; email: string | null; first_name: string | null; last_name: string | null };

function displayName(profile?: Profile): string {
  if (!profile) return 'Bytewise member';
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
  return name || profile.email?.split('@')[0] || 'Bytewise member';
}

async function loadProfiles(ids: string[]): Promise<Map<string, Profile>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, first_name, last_name')
    .in('id', Array.from(new Set(ids)));
  if (error) throw error;
  return new Map((data || []).map((p: Profile) => [p.id, p]));
}

async function acceptedFriendIds(userId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('friend_connections')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) throw error;
  return (data || []).map((c: any) => (c.requester_id === userId ? c.addressee_id : c.requester_id));
}

function fail(res: Response, label: string, error: any) {
  console.error(`❌ ${label}:`, error?.message || error);
  res.status(500).json({ message: label });
}

const idParam = z.coerce.number().int().positive();
const inviteSchema = z.object({ email: z.string().trim().toLowerCase().email() });

const shareSchema = z.object({
  type: z.enum(['meal', 'fast', 'water']),
  title: z.string().trim().min(1).max(200),
  details: z.record(z.union([z.string(), z.number(), z.null()])).optional(),
  note: z.string().trim().max(280).optional(),
});

const summarySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayStart: z.string().datetime(),
  dayEnd: z.string().datetime(),
  note: z.string().trim().max(280).optional(),
});

export function registerFriendsRoutes(app: Express) {
  app.get('/api/friends', isAuthenticated, async (req: any, res: Response) => {
    const userId: string = req.user?.id;
    try {
      const { data, error } = await supabaseAdmin
        .from('friend_connections')
        .select('id, status, requester_id, addressee_id, created_at')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const rows = data || [];
      const otherId = (row: any) => (row.requester_id === userId ? row.addressee_id : row.requester_id);
      const profiles = await loadProfiles(rows.map(otherId));

      const toPerson = (row: any) => {
        const profile = profiles.get(otherId(row));
        return {
          connectionId: row.id,
          userId: otherId(row),
          name: displayName(profile),
          email: profile?.email || '',
          since: row.created_at,
        };
      };

      res.json({
        friends: rows.filter(r => r.status === 'accepted').map(toPerson),
        incoming: rows.filter(r => r.status === 'pending' && r.requester_id !== userId).map(toPerson),
        outgoing: rows.filter(r => r.status === 'pending' && r.requester_id === userId).map(toPerson),
      });
    } catch (error) {
      fail(res, 'Failed to load friends', error);
    }
  });

  app.post('/api/friends/invite', isAuthenticated, async (req: any, res: Response) => {
    const userId: string = req.user?.id;
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    try {
      const escaped = parsed.data.email.replace(/[\\%_]/g, (c) => `\\${c}`);
      const { data: matches, error: lookupError } = await supabaseAdmin
        .from('users')
        .select('id')
        .ilike('email', escaped)
        .limit(1);
      if (lookupError) throw lookupError;

      const target = matches?.[0];
      if (!target) {
        return res.status(404).json({ message: 'No Bytewise member uses that email. Ask them to create an account first.' });
      }
      if (target.id === userId) {
        return res.status(400).json({ message: "That's your own email." });
      }

      const { data: existingRows, error: existingError } = await supabaseAdmin
        .from('friend_connections')
        .select('id, status, requester_id')
        .or(`and(requester_id.eq.${userId},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${userId})`)
        .limit(1);
      if (existingError) throw existingError;
      const existing = existingRows?.[0];

      if (existing?.status === 'accepted') {
        return res.status(409).json({ message: "You're already connected." });
      }
      if (existing && existing.requester_id === userId) {
        return res.status(409).json({ message: 'Invite already sent. Waiting for them to accept.' });
      }
      if (existing) {
        const { error } = await supabaseAdmin
          .from('friend_connections')
          .update({ status: 'accepted', responded_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
        return res.json({ status: 'accepted', message: 'They had already invited you, so you are now connected.' });
      }

      const { error: insertError } = await supabaseAdmin
        .from('friend_connections')
        .insert({ requester_id: userId, addressee_id: target.id });
      if (insertError) throw insertError;
      res.json({ status: 'pending', message: 'Invite sent. They will see it in Friends & Family.' });
    } catch (error) {
      fail(res, 'Failed to send invite', error);
    }
  });

  app.post('/api/friends/:id/accept', isAuthenticated, async (req: any, res: Response) => {
    const userId: string = req.user?.id;
    const id = idParam.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ message: 'Invalid invite' });

    try {
      const { data, error } = await supabaseAdmin
        .from('friend_connections')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', id.data)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .select('id');
      if (error) throw error;
      if (!data?.length) return res.status(404).json({ message: 'Invite not found' });
      res.json({ success: true });
    } catch (error) {
      fail(res, 'Failed to accept invite', error);
    }
  });

  // Declines an invite, cancels one you sent, or removes a connection.
  app.delete('/api/friends/:id', isAuthenticated, async (req: any, res: Response) => {
    const userId: string = req.user?.id;
    const id = idParam.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ message: 'Invalid connection' });

    try {
      const { data, error } = await supabaseAdmin
        .from('friend_connections')
        .delete()
        .eq('id', id.data)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .select('id');
      if (error) throw error;
      if (!data?.length) return res.status(404).json({ message: 'Connection not found' });
      res.json({ success: true });
    } catch (error) {
      fail(res, 'Failed to remove connection', error);
    }
  });

  app.get('/api/activity-feed', isAuthenticated, async (req: any, res: Response) => {
    const userId: string = req.user?.id;
    try {
      const authorIds = [userId, ...(await acceptedFriendIds(userId))];
      const { data, error } = await supabaseAdmin
        .from('shared_activities')
        .select('id, user_id, activity_type, title, details, note, created_at')
        .in('user_id', authorIds)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      const profiles = await loadProfiles((data || []).map((row: any) => row.user_id));
      res.json({
        activities: (data || []).map((row: any) => ({
          id: row.id,
          type: row.activity_type,
          title: row.title,
          details: row.details,
          note: row.note,
          createdAt: row.created_at,
          isMine: row.user_id === userId,
          author: displayName(profiles.get(row.user_id)),
        })),
      });
    } catch (error) {
      fail(res, 'Failed to load activity feed', error);
    }
  });

  app.post('/api/activities/share', isAuthenticated, async (req: any, res: Response) => {
    const userId: string = req.user?.id;
    const parsed = shareSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid activity' });
    }

    try {
      const { type, title, details, note } = parsed.data;
      const { data, error } = await supabaseAdmin
        .from('shared_activities')
        .insert({ user_id: userId, activity_type: type, title, details: details ?? null, note: note || null })
        .select('id')
        .single();
      if (error) throw error;
      res.json({ id: data.id });
    } catch (error) {
      fail(res, 'Failed to share activity', error);
    }
  });

  // Totals come from the server's own records so a shared summary can't be edited before posting.
  app.post('/api/activities/share-summary', isAuthenticated, async (req: any, res: Response) => {
    const userId: string = req.user?.id;
    const parsed = summarySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    try {
      const { date, dayStart, dayEnd, note } = parsed.data;
      // Meals and water are stored on the calendar day in UTC (noon and midnight respectively).
      const dayFrom = `${date}T00:00:00.000Z`;
      const dayTo = `${date}T23:59:59.999Z`;

      const [mealsResult, waterResult, fastResult] = await Promise.all([
        supabaseAdmin.from('meals').select('total_calories, total_protein')
          .eq('user_id', userId).gte('date', dayFrom).lte('date', dayTo),
        supabaseAdmin.from('water_intake').select('glasses')
          .eq('user_id', userId).gte('date', dayFrom).lte('date', dayTo),
        supabaseAdmin.from('fasting_sessions').select('plan_name, actual_duration')
          .eq('user_id', userId).eq('status', 'completed')
          .gte('completed_at', dayStart).lt('completed_at', dayEnd)
          .order('completed_at', { ascending: false }).limit(1),
      ]);
      for (const result of [mealsResult, waterResult, fastResult]) {
        if (result.error) throw result.error;
      }

      const meals = mealsResult.data || [];
      const fast: any = fastResult.data?.[0];
      const details = {
        meals: meals.length,
        calories: Math.round(meals.reduce((sum: number, m: any) => sum + (Number(m.total_calories) || 0), 0)),
        protein: Math.round(meals.reduce((sum: number, m: any) => sum + (Number(m.total_protein) || 0), 0)),
        water: Math.max(0, ...(waterResult.data || []).map((w: any) => Number(w.glasses) || 0)),
        fast: fast ? `${fast.plan_name}${fast.actual_duration ? ` · ${Math.round(fast.actual_duration / 3600000)}h` : ''}` : null,
      };

      const { data, error } = await supabaseAdmin
        .from('shared_activities')
        .insert({ user_id: userId, activity_type: 'summary', title: "Today's summary", details, note: note || null })
        .select('id')
        .single();
      if (error) throw error;
      res.json({ id: data.id, details });
    } catch (error) {
      fail(res, 'Failed to share summary', error);
    }
  });

  app.delete('/api/activities/:id', isAuthenticated, async (req: any, res: Response) => {
    const userId: string = req.user?.id;
    const id = idParam.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ message: 'Invalid activity' });

    try {
      const { data, error } = await supabaseAdmin
        .from('shared_activities')
        .delete()
        .eq('id', id.data)
        .eq('user_id', userId)
        .select('id');
      if (error) throw error;
      if (!data?.length) return res.status(404).json({ message: 'Activity not found' });
      res.json({ success: true });
    } catch (error) {
      fail(res, 'Failed to delete activity', error);
    }
  });
}
