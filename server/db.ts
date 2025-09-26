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
    console.error('❌ DATABASE_URL Error Details:');
    console.error('   Current DATABASE_URL:', databaseUrl ? databaseUrl.substring(0, 30) + '...' : 'undefined');
    console.error('   Expected format: postgresql://postgres:password@host:5432/database');
    console.error('   Current starts with:', databaseUrl ? databaseUrl.substring(0, 10) : 'N/A');
    console.error('');
    console.error('🚂 TO FIX: Get Railway PostgreSQL URL from Railway.app dashboard:');
    console.error('   1. Go to Railway.app → Your PostgreSQL service');
    console.error('   2. Click "Connect" tab → Copy "Postgres Connection URL"');
    console.error('   3. In Replit: Secrets → Edit DATABASE_URL → Paste Railway URL');
    console.error('');
    throw new Error(
      "DATABASE_URL must be a PostgreSQL connection string from Railway (starts with postgresql://)",
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