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

// Create PostgreSQL client for Railway with robust connection settings
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Railway requires SSL
  max: 10, // Increase pool size for Railway
  min: 2, // Keep at least 2 connections open
  idleTimeoutMillis: 30000, // Shorter idle timeout to prevent stale connections
  connectionTimeoutMillis: 30000, // Longer connection timeout for Railway
  statement_timeout: 60000, // 60 second statement timeout
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 0, // Start keep-alive immediately
  // Additional Railway-specific settings
  application_name: 'bytewise-nutritionist',
});

console.log('🔒 Railway database SSL mode: enabled with rejectUnauthorized: false');

// Enhanced error handling and recovery for Railway PostgreSQL
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  console.error('🔧 Connection will be automatically recreated on next request');
  
  // Force cleanup of stale connections
  setTimeout(() => {
    console.log('🔄 Cleaning up stale database connections...');
    // End all idle connections to force fresh connections
    pool.end().catch(() => {}).then(() => {
      console.log('🔄 Database pool reset, new connections will be created');
    });
  }, 5000);
});

pool.on('connect', (client) => {
  console.log('✅ New database connection established');
  
  // Set connection-specific settings for Railway
  client.query(`
    SET statement_timeout = '60s';
    SET lock_timeout = '30s';
    SET idle_in_transaction_session_timeout = '30s';
  `).catch(err => console.log('⚠️ Could not set connection parameters:', err.message));
});

pool.on('remove', (client) => {
  console.log('🔄 Database connection removed from pool');
});

// Add connection health check
const isConnectionHealthy = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch {
    return false;
  }
};

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

// Enhanced retry wrapper for Railway database operations
const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 5): Promise<T> => {
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
        error.code === 'ECONNREFUSED' ||
        error.code === 'EPIPE' ||
        error.message?.includes('Connection terminated') ||
        error.message?.includes('connect ECONNREFUSED') ||
        error.message?.includes('read ECONNRESET') ||
        error.message?.includes('write EPIPE') ||
        error.message?.includes('Connection lost') ||
        error.message?.includes('server closed the connection')
      );
      
      if (!isRetryableError || attempt === maxRetries) {
        console.log(`❌ Database operation failed after ${attempt} attempts:`, {
          error: error.message,
          code: error.code,
          attempt: attempt,
          maxRetries: maxRetries,
          isRetryable: isRetryableError
        });
        throw error;
      }
      
      const waitTime = Math.min(Math.pow(2, attempt) * 1000, 10000); // Cap at 10 seconds
      console.log(`🔄 Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms...`);
      
      // Wait before retry with exponential backoff (capped at 10s)
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};

// Create db instance with retry wrapper
export const db = drizzle(pool, { schema });

// Export retry wrapper for use in storage operations
export { withRetry };