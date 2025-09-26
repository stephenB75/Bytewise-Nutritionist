import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Database connection setup
const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT } = process.env;
let databaseUrl = process.env.DATABASE_URL;

// Construct from PG environment variables if needed
if (!databaseUrl || (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://'))) {
  if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE && PGPORT) {
    databaseUrl = `postgresql://${PGUSER}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
    console.log('✅ Using constructed DATABASE_URL from PG environment variables');
  } else {
    throw new Error("DATABASE_URL not configured. Please set up a PostgreSQL database.");
  }
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create PostgreSQL client with flexible SSL configuration
const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isLocalhost ? false : { rejectUnauthorized: false }, // SSL for production, none for localhost
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

console.log('🔒 Database SSL mode:', isLocalhost ? 'disabled (localhost)' : 'enabled with rejectUnauthorized: false');

// Test connection on startup
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

export const db = drizzle(pool, { schema });