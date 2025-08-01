/**
 * Test Supabase Connection
 * 
 * Verifies that Supabase is properly configured and database is set up
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('⚠️  Database schema not yet applied');
        console.log('📋 Please run the database setup:');
        console.log('1. Copy supabase/migrations/001_initial_schema.sql');
        console.log('2. Paste in Supabase SQL Editor');
        console.log('3. Click Run');
        return false;
      } else {
        console.log('❌ Connection error:', error.message);
        return false;
      }
    }
    
    console.log('✅ Database connection successful!');
    console.log('✅ Schema is properly set up');
    return true;
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Bytewise is ready to use!');
  } else {
    console.log('🔧 Setup required - see QUICK_SETUP.md');
  }
});