import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";
import { getDatabaseUrl, isDatabaseConfigured } from './env';

export { isDatabaseConfigured };

// Database connection - Use provided DATABASE_URL (from Supabase Postgres)
const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  console.error(
    'DATABASE_URL is missing on Railway. Auth still works via Supabase; set DATABASE_URL to your Supabase Postgres URI for meals/water persistence.'
  );
} else {
  console.log('✅ Using database connection:', databaseUrl.replace(/:([^@]+)@/, ':***@'));
}

// Create PostgreSQL client with optimized connection settings (skip fake localhost — it caused 20s auth hangs)
const pool = databaseUrl
  ? new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Database requires SSL
  max: 20, // Support higher concurrency 
  min: 2, // Keep minimal connections open
  idleTimeoutMillis: 300000, // 5 minutes idle timeout
  connectionTimeoutMillis: 20000, // 20 second connection timeout
  statement_timeout: 30000, // 30 second statement timeout
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 10000, // Wait 10s before first keep-alive probe
  application_name: 'bytewise-nutritionist',
})
  : null;

if (pool) {
  console.log('🔒 Database SSL mode: enabled with rejectUnauthorized: false');
}

// Enhanced error handling and recovery for PostgreSQL
pool?.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  console.error('🔧 Connection will be automatically recreated on next request');
});

pool?.on('connect', (client) => {
  console.log('✅ New database connection established');
  
  // Set connection-specific settings
  client.query(`
    SET statement_timeout = '30s';
    SET lock_timeout = '10s';
    SET idle_in_transaction_session_timeout = '60s';
  `).catch(err => console.log('⚠️ Could not set connection parameters:', err.message));
});

pool?.on('remove', (client) => {
  console.log('🔄 Database connection removed from pool');
});

// Add connection health check
const isConnectionHealthy = async (): Promise<boolean> => {
  if (!pool) return false;
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
  if (!pool) {
    return;
  }
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
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Connection terminated') ||
        error.message?.includes('connect ECONNREFUSED') ||
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
      
      const waitTime = Math.min(Math.pow(2, attempt) * 500, 3000); // Cap at 3 seconds
      console.log(`🔄 Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms...`);
      
      // Wait before retry with exponential backoff (capped at 3s)
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};

// Create db instance with retry wrapper
export const db = pool ? drizzle(pool, { schema }) : (null as unknown as ReturnType<typeof drizzle>);

// Export retry wrapper for use in storage operations
export { withRetry };