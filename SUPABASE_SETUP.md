# Supabase Auth Setup Guide

This guide will help you set up Supabase Authentication for WriterSquire.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: WriterSquire (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be created (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (for frontend)
   - **service_role key** (for backend - keep this secret!)

## Step 3: Configure Environment Variables

### Backend (.env)

Create `backend/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/writerssquire
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Frontend (.env)

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3001

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Configure OAuth Providers (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Create OAuth client:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (for development)
7. Copy **Client ID** and **Client Secret**
8. In Supabase: **Authentication** → **Providers** → **Google**
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: WriterSquire
   - **Homepage URL**: `http://localhost:5173` (or your domain)
   - **Authorization callback URL**: 
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (for development)
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**
6. In Supabase: **Authentication** → **Providers** → **GitHub**
   - Enable GitHub provider
   - Paste Client ID and Client Secret
   - Save

## Step 5: Configure Email Templates (Optional)

1. In Supabase: **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Reset password
   - Magic link
   - Change email address

## Step 6: Configure Site URL

1. In Supabase: **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/**` (for development)

## Step 7: Test Authentication

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:5173/register`
4. Create an account
5. Check your email for verification (if email verification is enabled)
6. Sign in at `http://localhost:5173/login`

## Troubleshooting

### "Missing Supabase environment variables"

- Make sure `.env` files exist in both `backend/` and `frontend/` directories
- Check that variable names match exactly (case-sensitive)
- Restart your dev servers after adding environment variables

### "Invalid token" errors

- Check that `SUPABASE_SERVICE_ROLE_KEY` is correct (not the anon key)
- Verify `SUPABASE_URL` is correct
- Make sure backend can reach Supabase API

### OAuth redirect not working

- Check redirect URLs match exactly in both Supabase and OAuth provider settings
- Make sure Site URL is configured in Supabase
- For local development, use `http://localhost:5173` (not `https://`)

### User not syncing to MongoDB

- Check backend logs for errors
- Verify MongoDB connection is working
- Check that `/api/auth/sync` endpoint is being called
- Verify JWT token is being sent correctly

## Security Notes

- **Never commit `.env` files** to version control
- **Service Role Key** has admin access - keep it secret!
- **Anon Key** is safe for frontend (protected by Row Level Security)
- Use environment variables in production (not hardcoded values)

## Next Steps

- Set up email verification (recommended for production)
- Configure password requirements
- Set up MFA (Multi-Factor Authentication) if needed
- Configure rate limiting
- Set up custom email templates

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
