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

// Create PostgreSQL client for Railway with optimized settings
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Railway requires SSL
  max: 3, // Allow up to 3 concurrent connections
  min: 1, // Keep at least 1 connection open
  idleTimeoutMillis: 60000, // Keep connections alive for 60 seconds
  connectionTimeoutMillis: 10000, // 10 second connection timeout for Railway latency
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 10000, // Wait 10s before first keep-alive probe
});

console.log('🔒 Railway database SSL mode: enabled with rejectUnauthorized: false');

// Enhanced error handling and recovery for Railway PostgreSQL
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  console.error('🔧 Connection will be automatically recreated on next request');
});

pool.on('connect', (client) => {
  console.log('✅ New database connection established');
});

pool.on('remove', (client) => {
  console.log('🔄 Database connection removed from pool');
});

// Test connection on startup with retry logic
const testConnection = async () => {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connection test successful');
      break;
    } catch (error) {
      attempts++;
      console.error(`❌ Database connection test failed (attempt ${attempts}/${maxAttempts}):`, error);
      
      if (attempts === maxAttempts) {
        console.error('🚨 Failed to establish database connection after max attempts');
        // Don't throw - let the app start but log the issue
      } else {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
};

// Test connection asynchronously
testConnection();

// Retry wrapper for database operations
const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a connection-related error that we should retry
      const isRetryableError = (
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('Connection terminated') ||
        error.message?.includes('connect ECONNREFUSED') ||
        error.message?.includes('read ECONNRESET')
      );
      
      if (!isRetryableError || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`🔄 Database operation failed (attempt ${attempt}/${maxRetries}), retrying...`);
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw lastError!;
};

// Create db instance with retry wrapper
export const db = drizzle(pool, { schema });

// Export retry wrapper for use in storage operations
export { withRetry };