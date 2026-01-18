import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for frontend
 * 
 * MODERN KEY FORMAT (2024+):
 * - Publishable Key: sb_publishable_... (for client-side, respects RLS)
 * - Secret Key: sb_secret_... (NEVER use on frontend!)
 * 
 * The publishable key is safe to expose in the browser.
 * It only allows operations permitted by Row Level Security (RLS) policies.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabasePublishableKey) {
  throw new Error(
    'Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable.\n' +
    'Get it from: Supabase Dashboard → Settings → API → Publishable keys\n' +
    'It should start with "sb_publishable_..."'
  );
}

/**
 * Supabase client for frontend authentication
 * 
 * Features:
 * - Auto-refreshes tokens when they expire
 * - Persists session in localStorage
 * - Handles OAuth callback URLs
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
