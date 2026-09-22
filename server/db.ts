import dns from 'node:dns';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";
import { getDatabaseUrl, isDatabaseConfigured } from './env';

// Railway/containers often lack IPv6 egress; Supabase direct host prefers AAAA records.
dns.setDefaultResultOrder('ipv4first');

export { isDatabaseConfigured };

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  console.error(
    'DATABASE_URL is missing on Railway. Auth still works via Supabase; set DATABASE_URL to your Supabase Postgres URI for meals/water persistence.'
  );
} else {
  console.log('✅ Using database connection:', databaseUrl.replace(/:([^@]+)@/, ':***@'));
  if (/db\.[^/]+\.supabase\.co:5432/.test(databaseUrl)) {
    console.warn(
      '⚠️ Direct Supabase DB (:5432) may use IPv6 and fail on Railway. Use Session pooler :6543 (postgres.PROJECT_REF@aws-0-REGION.pooler.supabase.com).'
    );
  }
}

function createPool(): Pool | null {
  if (!databaseUrl) {
    return null;
  }

  try {
    return new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false },
      max: 10,
      min: 0,
      idleTimeoutMillis: 300000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      application_name: 'bytewise-nutritionist',
    });
  } catch (error) {
    console.error('❌ Failed to create database pool (app will use Supabase REST fallback):', error);
    return null;
  }
}

const pool = createPool();

if (pool) {
  console.log('🔒 Database SSL mode: enabled with rejectUnauthorized: false');
}

pool?.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

pool?.on('connect', (client) => {
  client
    .query(`
      SET statement_timeout = '30s';
      SET lock_timeout = '10s';
      SET idle_in_transaction_session_timeout = '60s';
    `)
    .catch((err) => console.log('⚠️ Could not set connection parameters:', err.message));
});

const testConnection = async () => {
  if (!pool) {
    return;
  }
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Database connection test successful');
      return;
    } catch (error) {
      attempts++;
      console.error(`❌ Database connection test failed (attempt ${attempts}/${maxAttempts}):`, error);
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
  console.error('🚨 Database unreachable after retries — API will use Supabase admin fallback where possible');
};

void testConnection();

const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      const isRetryableError =
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Connection terminated') ||
        error.message?.includes('connect ECONNREFUSED') ||
        error.message?.includes('Connection lost') ||
        error.message?.includes('server closed the connection');

      if (!isRetryableError || attempt === maxRetries) {
        throw error;
      }

      const waitTime = Math.min(Math.pow(2, attempt) * 500, 3000);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

const drizzleDb = pool ? drizzle(pool, { schema }) : null;

export const db = drizzleDb as ReturnType<typeof drizzle>;

export function isDbReady(): boolean {
  return Boolean(drizzleDb);
}

export { withRetry };
