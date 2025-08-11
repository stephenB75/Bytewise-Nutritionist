import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

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

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });