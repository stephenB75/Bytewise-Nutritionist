import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Construct DATABASE_URL from individual components if it's corrupted
let databaseUrl = process.env.DATABASE_URL;

// Always build Supabase DATABASE_URL from environment variables to ensure proper format
const supabasePassword = process.env.SUPABASE_DB_PASSWORD;
const supabaseUrl = process.env.VITE_SUPABASE_URL;

if (!supabasePassword || !supabaseUrl) {
  throw new Error(
    "Supabase credentials are missing. Please provide SUPABASE_DB_PASSWORD and VITE_SUPABASE_URL.",
  );
}

// Extract project reference from Supabase URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
databaseUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(supabasePassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
console.log('✅ Constructed Supabase DATABASE_URL:', databaseUrl.replace(/:([^@]+)@/, ':***@'));

// Create PostgreSQL client for Supabase
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: true, // Enable SSL for Supabase
  max: 1, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

export const db = drizzle(pool, { schema });