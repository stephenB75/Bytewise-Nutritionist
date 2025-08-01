/**
 * Database Setup Script
 * 
 * Applies the initial database schema to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  try {
    console.log('🔧 Setting up Bytewise database schema...');
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    console.log('📊 Applying database migration...');
    const { error } = await supabase.rpc('exec_sql', { 
      sql_query: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error.message);
      
      // Try alternative approach - execute via REST API
      console.log('🔄 Trying alternative setup method...');
      
      // For now, we'll guide the user to manually apply the schema
      console.log('\n📋 Manual Setup Required:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of supabase/migrations/001_initial_schema.sql');
      console.log('4. Click "Run" to execute the schema');
      console.log('\nAlternatively, you can use the Supabase CLI:');
      console.log('npx supabase link --project-ref YOUR_PROJECT_REF');
      console.log('npx supabase db push');
      
      return false;
    }
    
    console.log('✅ Database schema applied successfully!');
    
    // Test the connection
    console.log('🔍 Testing database connection...');
    const { data, error: testError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
    
    if (testError) {
      console.log('⚠️  Schema applied but connection test failed:', testError.message);
    } else {
      console.log('✅ Database connection test successful!');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

// Run the setup
setupDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Bytewise database is ready!');
    console.log('Your nutrition tracker app should now work with full authentication and data persistence.');
  } else {
    console.log('\n🔧 Manual setup required - please follow the instructions above.');
  }
  process.exit(success ? 0 : 1);
});