import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Construct DATABASE_URL from individual components if it's corrupted
let databaseUrl = process.env.DATABASE_URL;
console.log('🔍 DATABASE_URL from env:', databaseUrl ? 'exists' : 'missing');
console.log('🔍 DATABASE_URL value:', databaseUrl?.substring(0, 20) + '...' || 'undefined');

// Use Railway DATABASE_URL or fallback to environment construction
if (!databaseUrl || (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://'))) {
  // Check for Railway connection URL first
  const railwayUrl = process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL;
  
  if (railwayUrl && (railwayUrl.startsWith('postgres://') || railwayUrl.startsWith('postgresql://'))) {
    databaseUrl = railwayUrl;
    console.log('✅ Using Railway DATABASE_URL:', databaseUrl.replace(/:([^@]+)@/, ':***@'));
  } else {
    throw new Error(
      "DATABASE_URL is missing. Please provide a valid PostgreSQL connection URL from Railway.",
    );
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