import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Railway PostgreSQL database connection
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Please provide the Railway PostgreSQL connection URL.");
}

// Handle Railway's different DATABASE_URL formats
if (databaseUrl.startsWith('[Railway PostgreSQL')) {
  // In production, Railway might provide a reference format
  // Fall back to constructing from individual environment variables
  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
  if (PGHOST && PGPORT && PGUSER && PGPASSWORD && PGDATABASE) {
    databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
    console.log('🔧 Constructed DATABASE_URL from Railway environment variables');
  } else {
    throw new Error("Railway environment variables incomplete. Missing PGHOST, PGPORT, PGUSER, PGPASSWORD, or PGDATABASE.");
  }
}

// Validate it's a proper PostgreSQL connection string  
if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
  throw new Error(
    `Invalid DATABASE_URL format. Expected PostgreSQL connection string from Railway (starts with postgresql://), got: ${databaseUrl.substring(0, 20)}...`
  );
}

console.log('✅ Using Railway DATABASE_URL:', databaseUrl.replace(/:([^@]+)@/, ':***@'));

// Create PostgreSQL client for Railway
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Railway requires SSL
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

console.log('🔒 Railway database SSL mode: enabled with rejectUnauthorized: false');

// Test connection on startup
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

export const db = drizzle(pool, { schema });