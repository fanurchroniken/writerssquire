import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Supabase client for server-side JWT verification and auth operations
 * 
 * MODERN KEY FORMAT (2024+):
 * - Secret Key: sb_secret_... (for server-side, bypasses RLS)
 * - Publishable Key: sb_publishable_... (for client-side, respects RLS)
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Required: SUPABASE_URL and SUPABASE_SECRET_KEY\n' +
    'Get Secret Key from: Supabase Dashboard → Settings → API → Secret keys (sb_secret_...)'
  );
}

/**
 * Supabase admin client for server-side operations
 * Used for JWT verification and privileged database access
 */
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

/**
 * Verify a JWT token from Supabase Auth
 * 
 * The token comes from the frontend after user login.
 * We use the admin client to verify it's valid.
 * 
 * @param token - JWT access token from Supabase Auth
 * @returns User data if token is valid, null otherwise
 */
export async function verifySupabaseToken(token: string) {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) {
      console.error('Token verification error:', error.message);
      return null;
    }
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error: any) {
    console.error('Error verifying Supabase token:', error?.message || error);
    return null;
  }
}
