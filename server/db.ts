import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Construct DATABASE_URL from individual components if it's corrupted
let databaseUrl = process.env.DATABASE_URL;

// Check if DATABASE_URL is valid (should start with postgres:// or postgresql://)
if (!databaseUrl || (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://'))) {
  // Build DATABASE_URL from individual PostgreSQL environment variables
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
  
  if (!PGUSER || !PGPASSWORD || !PGHOST || !PGPORT || !PGDATABASE) {
    throw new Error(
      "DATABASE_URL is invalid and individual PostgreSQL environment variables are missing. Please provision a database.",
    );
  }
  
  databaseUrl = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
  console.log('Constructed DATABASE_URL from individual environment variables');
}

// Create PostgreSQL client for Supabase
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
  max: 1 // Maximum number of connections
});
export const db = drizzle(pool, { schema });