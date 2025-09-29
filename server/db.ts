import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Supabase PostgreSQL database connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabasePassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl || !supabasePassword) {
  throw new Error("Missing Supabase database configuration. SUPABASE_URL and SUPABASE_DB_PASSWORD are required.");
}

// Extract project ID from Supabase URL for database connection
// Supabase URL format: https://PROJECT_ID.supabase.co
const supabaseProject = supabaseUrl.replace('https://', '').split('.')[0];
const databaseUrl = `postgresql://postgres:${supabasePassword}@db.${supabaseProject}.supabase.co:5432/postgres`;

console.log('✅ Using Supabase PostgreSQL database:', `postgresql://postgres:***@db.${supabaseProject}.supabase.co:5432/postgres`);

// Create PostgreSQL client for Supabase with optimized connection settings
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  max: 20, // Supabase supports higher concurrency
  min: 5, // Keep more connections open for better performance
  idleTimeoutMillis: 300000, // 5 minutes - Supabase handles longer idle times well
  connectionTimeoutMillis: 20000, // 20 second connection timeout
  statement_timeout: 30000, // 30 second statement timeout
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 10000, // Wait 10s before first keep-alive probe
  // Supabase-specific settings
  application_name: 'bytewise-nutritionist',
});

console.log('🔒 Supabase database SSL mode: enabled with rejectUnauthorized: false');

// Enhanced error handling and recovery for Supabase PostgreSQL
pool.on('error', (err) => {
  console.error('❌ Supabase database pool error:', err);
  console.error('🔧 Connection will be automatically recreated on next request');
});

pool.on('connect', (client) => {
  console.log('✅ New Supabase database connection established');
  
  // Set connection-specific settings for Supabase
  client.query(`
    SET statement_timeout = '30s';
    SET lock_timeout = '10s';
    SET idle_in_transaction_session_timeout = '60s';
  `).catch(err => console.log('⚠️ Could not set connection parameters:', err.message));
});

pool.on('remove', (client) => {
  console.log('🔄 Supabase database connection removed from pool');
});

// Add connection health check for Supabase
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

// Simplified retry wrapper for Supabase database operations
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
        console.log(`❌ Supabase database operation failed after ${attempt} attempts:`, {
          error: error.message,
          code: error.code,
          attempt: attempt,
          maxRetries: maxRetries,
          isRetryable: isRetryableError
        });
        throw error;
      }
      
      const waitTime = Math.min(Math.pow(2, attempt) * 500, 3000); // Cap at 3 seconds for Supabase
      console.log(`🔄 Supabase database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms...`);
      
      // Wait before retry with exponential backoff (capped at 3s)
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};

// Create db instance with retry wrapper
export const db = drizzle(pool, { schema });

// Export retry wrapper for use in storage operations
export { withRetry };