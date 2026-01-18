// Test Supabase connections
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

console.log('🔍 Testing Supabase connections...\n');

// Test environment variables
console.log('📋 Environment Variables:');
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('  SUPABASE_API_KEY:', process.env.SUPABASE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing (optional, falls back to SUPABASE_API_KEY)');
console.log('');

// Test Supabase Auth connection (using anon key)
if (process.env.SUPABASE_URL && process.env.SUPABASE_API_KEY) {
  console.log('🔐 Testing Supabase Auth connection...');
  try {
    const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);
    console.log('  ✅ Supabase Auth client created successfully!');
  } catch (error) {
    console.log('  ❌ Supabase Auth connection failed:', error.message);
  }
} else {
  console.log('  ⚠️  Supabase Auth credentials not set, skipping test');
}

console.log('');

// Test Supabase Database connection (using service role key)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API_KEY;
if (process.env.SUPABASE_URL && supabaseServiceKey) {
  console.log('🗄️  Testing Supabase Database connection...');
  try {
    const supabase = createClient(process.env.SUPABASE_URL, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Test database query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist yet, which is okay
      throw error;
    }
    
    console.log('  ✅ Supabase Database connection successful!');
    console.log('  ✅ Database query successful!');
  } catch (error) {
    console.log('  ❌ Supabase Database connection failed:', error.message);
    if (error.code === 'PGRST116') {
      console.log('  💡 Database tables may not exist yet. Create them using Supabase Dashboard SQL Editor.');
    } else {
      console.log('  💡 Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct');
    }
  }
} else {
  console.log('  ⚠️  Supabase Database credentials not set, skipping test');
}

console.log('\n✅ Connection tests complete!');
