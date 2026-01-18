import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Supabase configuration for server-side database operations
 * 
 * MODERN KEY FORMAT (2024+):
 * - Secret Key: sb_secret_... (for server-side, bypasses RLS)
 * - Publishable Key: sb_publishable_... (for client-side, respects RLS)
 * 
 * We use the SECRET key here because this is the backend server.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseSecretKey) {
  throw new Error(
    'Missing SUPABASE_SECRET_KEY environment variable.\n' +
    'Get it from: Supabase Dashboard → Settings → API → Secret keys\n' +
    'It should start with "sb_secret_..."'
  );
}

// Validate key format (new keys start with sb_secret_ or sb_publishable_)
const isNewKeyFormat = supabaseSecretKey.startsWith('sb_secret_');
const isLegacyJWT = supabaseSecretKey.startsWith('eyJ');

if (!isNewKeyFormat && !isLegacyJWT) {
  console.warn('⚠️  SUPABASE_SECRET_KEY format not recognized. Expected sb_secret_... or JWT format.');
}

if (isNewKeyFormat) {
  console.log('✅ Using modern Supabase Secret Key (sb_secret_...)');
} else if (isLegacyJWT) {
  console.log('⚠️  Using legacy JWT service_role key. Consider migrating to sb_secret_... format.');
}

/**
 * Supabase client for server-side database operations
 * 
 * SECURITY:
 * - The secret key bypasses Row Level Security (RLS) and has admin access
 * - This client should ONLY be used server-side
 * - NEVER expose SUPABASE_SECRET_KEY to the client/frontend
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

/**
 * Supabase Admin client - same as supabase but aliased for clarity
 * Used for operations that require admin access (storage, etc.)
 */
export const supabaseAdmin: SupabaseClient = supabase;

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<void> {
  try {
    // Simple test - try to query the users table
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      // Check for specific error codes
      if (error.code === 'PGRST116') {
        // Table doesn't exist or no rows - table might not be created yet
        console.log('⚠️  Database tables not found. Run the SQL schema in Supabase Dashboard.');
        console.log('   See: backend/supabase-schema.sql');
        return;
      }
      
      if (error.code === '42P01') {
        // Relation does not exist
        console.log('⚠️  Database tables not created yet. Run backend/supabase-schema.sql');
        return;
      }
      
      if (error.message?.includes('Invalid API key') || error.message?.includes('Legacy API keys')) {
        console.error('❌ API Key Error:', error.message);
        console.log('');
        console.log('📋 To fix this:');
        console.log('   1. Go to Supabase Dashboard → Settings → API');
        console.log('   2. Copy your Secret key (starts with sb_secret_...)');
        console.log('   3. Update SUPABASE_SECRET_KEY in backend/.env');
        return;
      }
      
      // Other error - log but continue
      console.warn('⚠️  Database test query returned:', error.message);
      return;
    }
    
    console.log('✅ Supabase database connection verified');
  } catch (error: any) {
    console.warn('⚠️  Database connection test error:', error?.message || error);
  }
}

export default supabase;
