# Supabase Best Practices Setup

## ✅ Current Configuration

This project follows Supabase best practices using **only**:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_API_KEY` - Your anon/publishable key (same as frontend)

## Security Model

### How It Works

1. **Server-side operations use anon key with user JWT tokens**
   - All database operations respect Row Level Security (RLS) policies
   - User's JWT token is passed to create user-scoped clients
   - Operations are limited to what the authenticated user can access

2. **RLS Policies enforce security at the database level**
   - Users can only read/update their own data
   - Users can only create records with their own `supabase_id`
   - All operations are checked against `auth.uid()` in RLS policies

3. **No service_role key needed for normal operations**
   - More secure: follows principle of least privilege
   - Simpler configuration: only one key to manage
   - Same key used in frontend and backend

## Environment Variables

### Backend (`backend/.env`)

```env
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-anon-publishable-key

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Supabase Configuration (same URL and key as backend!)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key  # Same as SUPABASE_API_KEY
```

## How Database Operations Work

### 1. User-Scoped Operations

When performing operations on behalf of an authenticated user:

```typescript
import { createUserClient } from '../config/database.js';

// Create a user-scoped client with their JWT token
const userSupabase = createUserClient(jwtToken);

// This respects RLS policies - user can only access their own data
const { data, error } = await userSupabase
  .from('users')
  .select('*')
  .eq('supabase_id', userId)
  .single();
```

### 2. Base Client (for unauthenticated operations)

For operations that don't require user context (rare):

```typescript
import { supabase } from '../config/database.js';

// This will be blocked by RLS if no auth token
const { data, error } = await supabase
  .from('users')
  .select('*');
```

## RLS Policies

The database schema includes RLS policies that:

1. **Allow users to create their own record** (for initial signup sync)
2. **Allow users to read/update their own data**
3. **Allow users to manage their own worlds and documents**
4. **Block all other operations**

All policies check `auth.uid()::text = supabase_id` to ensure users can only access their own data.

## When Service Role Key Would Be Needed

The service_role key (secret key) is **only** needed if you need to:

1. Bypass RLS policies (admin operations)
2. Perform operations not tied to a specific user
3. Manage users programmatically from backend

**For normal application operations, the anon key with user JWT tokens is sufficient and more secure.**

## Benefits of This Approach

✅ **More Secure**: RLS policies enforce security at the database level  
✅ **Simpler**: Only one key to manage (same as frontend)  
✅ **Best Practice**: Follows Supabase's recommended security model  
✅ **Least Privilege**: Operations limited to what users can access  
✅ **Auditable**: All operations are logged with user context  

## Setup Checklist

- [ ] Set `SUPABASE_URL` in `backend/.env`
- [ ] Set `SUPABASE_API_KEY` in `backend/.env` (anon/publishable key)
- [ ] Set `VITE_SUPABASE_URL` in `frontend/.env` (same as backend)
- [ ] Set `VITE_SUPABASE_ANON_KEY` in `frontend/.env` (same as backend's API key)
- [ ] Run `backend/supabase-schema.sql` in Supabase Dashboard SQL Editor
- [ ] Verify RLS policies are active in Supabase Dashboard

## Getting Your Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **anon/public key** (publishable) → `SUPABASE_API_KEY` and `VITE_SUPABASE_ANON_KEY`

**Do NOT use the service_role/secret key for normal operations** - it bypasses all security!
