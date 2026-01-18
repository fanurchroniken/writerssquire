import { supabase } from '../config/database.js';

/**
 * User type matching the Supabase database schema
 */
export interface User {
  id: string;
  supabase_id: string;
  email: string;
  username: string;
  password_hash?: string | null;
  display_name?: string | null;
  avatar?: string | null;
  preferences?: Record<string, any> | null;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

/**
 * Service for managing user data in Supabase
 * Uses the server-side client with secret key for database operations
 */

/**
 * Sync or create user in Supabase database from Supabase Auth user
 * @param supabaseUser - User object from Supabase Auth
 * @returns User record from Supabase database
 */
export async function syncUserFromSupabase(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    display_name?: string;
    avatar?: string;
  };
}): Promise<User> {
  try {
    // Check if user already exists in Supabase database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_id', supabaseUser.id)
      .single();

    if (existingUser) {
      // Update existing user
      const updateData: Partial<User> = {
        email: supabaseUser.email || existingUser.email,
        display_name: supabaseUser.user_metadata?.display_name || existingUser.display_name,
        avatar: supabaseUser.user_metadata?.avatar || existingUser.avatar,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('supabase_id', supabaseUser.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return updatedUser as User;
    }

    // Create new user in Supabase database
    // Generate username from email if not provided
    const username = supabaseUser.user_metadata?.username || 
                     supabaseUser.email?.split('@')[0] || 
                     `user_${supabaseUser.id.slice(0, 8)}`;

    // Check if username is already taken
    let finalUsername = username;
    let counter = 1;
    let usernameExists = true;

    while (usernameExists) {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', finalUsername)
        .single();

      if (!existingUsername) {
        usernameExists = false;
      } else {
        finalUsername = `${username}_${counter}`;
        counter++;
      }
    }

    const newUser: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
      supabase_id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: finalUsername,
      display_name: supabaseUser.user_metadata?.display_name || finalUsername,
      avatar: supabaseUser.user_metadata?.avatar || null,
      subscription_tier: 'free',
      last_login_at: new Date().toISOString(),
      preferences: {},
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return createdUser as User;
  } catch (error) {
    console.error('Error syncing user from Supabase:', error);
    throw error;
  }
}

/**
 * Get user by Supabase ID
 */
export async function getUserBySupabaseId(supabaseId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('supabase_id', supabaseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data as User;
}

/**
 * Get user by database ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data as User;
}

/**
 * Get or create user - ensures user exists in database
 * Auto-syncs from Supabase Auth if user doesn't exist
 */
export async function getOrCreateUser(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    display_name?: string;
    avatar?: string;
  };
}): Promise<User> {
  // First try to get existing user
  let user = await getUserBySupabaseId(supabaseUser.id);
  
  // If user doesn't exist, create them
  if (!user) {
    user = await syncUserFromSupabase(supabaseUser);
  }
  
  return user;
}
