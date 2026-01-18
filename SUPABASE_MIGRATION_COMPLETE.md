# Supabase Setup Guide (Modern API Keys)

This project uses **Supabase** with the modern API key format (2024+).

---

## 🔑 API Keys Overview

Supabase now uses two types of API keys:

| Key Type | Prefix | Usage | Security |
|----------|--------|-------|----------|
| **Publishable Key** | `sb_publishable_...` | Frontend (browser) | Safe to expose, respects RLS |
| **Secret Key** | `sb_secret_...` | Backend (server) | Never expose, bypasses RLS |

---

## 📋 Setup Instructions

### Step 1: Get Your API Keys

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings → API**
4. Find the keys section:
   - **Publishable keys** → Copy the key starting with `sb_publishable_...`
   - **Secret keys** → Copy the key starting with `sb_secret_...`

### Step 2: Configure Backend

Create/update `backend/.env`:

```env
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_key_here

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Configure Frontend

Create/update `frontend/.env`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here

# API
VITE_API_URL=http://localhost:3001
```

### Step 4: Create Database Tables

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy the contents of `backend/supabase-schema.sql`
4. Click **Run**

---

## 🚀 Running the Application

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173

---

## ⚠️ Troubleshooting

### "Invalid API key" or "Legacy API keys are disabled"

You're using an old key format. Make sure:
- Backend uses `sb_secret_...` (not JWT starting with `eyJ...`)
- Frontend uses `sb_publishable_...` (not the old `anon` key)

### "User not found" when creating worlds

The database tables might not exist. Run `backend/supabase-schema.sql` in the Supabase SQL Editor.

### "Table does not exist" errors

Same as above - run the SQL schema to create the tables.

---

## 📁 Project Structure

```
backend/
├── .env                    # Your secret keys (gitignored)
├── src/
│   ├── config/
│   │   ├── database.ts     # Supabase client for database ops
│   │   └── supabase.ts     # Supabase client for auth verification
│   ├── routes/
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── worlds.ts       # World CRUD endpoints
│   │   └── documents.ts    # Document CRUD endpoints
│   └── services/
│       └── userService.ts  # User sync and management
└── supabase-schema.sql     # Database schema (run this in Supabase)

frontend/
├── .env                    # Your publishable key (gitignored)
├── src/
│   ├── lib/
│   │   └── supabase.ts     # Supabase client for frontend
│   ├── contexts/
│   │   └── AuthContext.tsx # Auth state management
│   └── pages/
│       └── Home.tsx        # Dashboard UI
```

---

## 🔒 Security Notes

1. **NEVER** commit `.env` files to git
2. **NEVER** use the secret key (`sb_secret_...`) in frontend code
3. The publishable key is safe for browsers - it only allows RLS-permitted operations
4. All sensitive operations go through the backend which uses the secret key
