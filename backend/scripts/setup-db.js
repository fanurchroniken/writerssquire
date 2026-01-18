// Setup script to help configure Supabase database
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_API_KEY) are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  try {
    console.log('🔍 Testing Supabase database connection...');
    
    // Test connection by querying users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist yet, which is okay
      throw error;
    }
    
    console.log('✅ Supabase database connection successful!');
    
    // Check if users table exists
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('*')
      .limit(0);
    
    if (tablesError && tablesError.code === 'PGRST116') {
      console.log('\n⚠️  Users table not found. You need to create the database schema.');
      console.log('   Use the Supabase Dashboard SQL Editor to run the schema SQL.');
      console.log('   Or use Supabase migrations if you have them set up.');
    } else {
      console.log('✅ Database tables exist');
    }
    
  } catch (error) {
    console.error('❌ Supabase database connection failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. SUPABASE_URL is set in .env file');
    console.log('   2. SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_API_KEY) is set in .env file');
    console.log('   3. Your Supabase project is active');
    process.exit(1);
  }
}

setupDatabase();
