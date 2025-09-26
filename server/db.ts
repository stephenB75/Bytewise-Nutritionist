import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Use Replit PostgreSQL database environment variables
const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT } = process.env;

let databaseUrl = process.env.DATABASE_URL;

// If DATABASE_URL is invalid, construct from Replit PG environment variables
if (!databaseUrl || (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://'))) {
  if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE && PGPORT) {
    databaseUrl = `postgresql://${PGUSER}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
    console.log('✅ Using Replit PostgreSQL database:', databaseUrl.replace(/:([^@]+)@/, ':***@'));
  } else {
    console.error('❌ PostgreSQL environment variables missing');
    console.error('   PGHOST:', PGHOST ? 'exists' : 'missing');
    console.error('   PGUSER:', PGUSER ? 'exists' : 'missing');
    console.error('   PGPASSWORD:', PGPASSWORD ? 'exists' : 'missing');
    console.error('   PGDATABASE:', PGDATABASE ? 'exists' : 'missing');
    console.error('   PGPORT:', PGPORT ? 'exists' : 'missing');
    throw new Error("PostgreSQL database not configured. Please set up a database.");
  }
} else {
  console.log('✅ Using provided DATABASE_URL:', databaseUrl.replace(/:([^@]+)@/, ':***@'));
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