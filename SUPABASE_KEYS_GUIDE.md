# Supabase Keys Guide - Which Key to Use?

## Quick Answer

**Use the PUBLISHABLE key (anon/public key) for both frontend and backend.**

## Key Types in Supabase

Supabase has two main types of API keys:

### 1. **PUBLISHABLE Key** (formerly `anon` key)
- **Prefix**: `sb_publishable_...` or `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT format)
- **Location**: Settings → API → "anon" or "publishable" key
- **Security**: Safe to expose in frontend code
- **Permissions**: Subject to Row Level Security (RLS)
- **Use for**:
  - ✅ Frontend applications
  - ✅ Backend JWT verification (what we're doing)
  - ✅ Public API calls
  - ✅ User-authenticated requests

### 2. **SECRET Key** (formerly `service_role` key)
- **Prefix**: `sb_secret_...` or `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT format)
- **Location**: Settings → API → "service_role" or "secret" key
- **Security**: ⚠️ **NEVER expose this** - treat like a password
- **Permissions**: Bypasses Row Level Security (RLS), has admin access
- **Use for**:
  - ✅ Backend admin operations
  - ✅ Bypassing RLS policies
  - ✅ User management operations
  - ❌ **NOT for JWT verification** (unless you need admin access)

## For WriterSquire

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key-here  # ← PUBLISHABLE key
```

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-publishable-key-here  # ← PUBLISHABLE key (same as frontend!)
```

**Yes, use the SAME publishable key in both frontend and backend!**

## Why Use Publishable Key for Backend?

For JWT verification, the publishable key is:
- ✅ **Sufficient**: Can verify tokens and get user info
- ✅ **More Secure**: Doesn't have admin access
- ✅ **Simpler**: Same key for frontend and backend
- ✅ **Best Practice**: Only use secret key when you need admin operations

## When Would You Need the Secret Key?

You would only need the secret key if you need to:
- Bypass Row Level Security policies
- Perform admin operations (create/delete users programmatically)
- Access all data regardless of user permissions
- Manage database directly from backend

For our use case (JWT verification and user sync), the publishable key is perfect.

## How to Find Your Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: This is your PUBLISHABLE key ← Use this!
   - **service_role secret**: This is your SECRET key ← Don't use for JWT verification

## Visual Guide

```
Supabase Dashboard → Settings → API

┌─────────────────────────────────────────┐
│ Project URL                              │
│ https://xxxxx.supabase.co               │
│                                          │
│ anon public                              │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← Use this (PUBLISHABLE)
│                                          │
│ service_role secret                      │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← Don't use (unless admin ops)
└─────────────────────────────────────────┘
```

## Summary

- **Frontend**: Use PUBLISHABLE key
- **Backend**: Use PUBLISHABLE key (same one!)
- **Secret Key**: Only if you need admin operations (we don't)

The publishable key is safe, sufficient, and the right choice for JWT verification! 🔐
