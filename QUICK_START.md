# 🚀 WriterSquire MVP - Quick Start Guide

Get your MVP running in 5 minutes!

## Prerequisites

- ✅ Node.js 20.x installed
- ✅ Supabase account (free tier works)
- ✅ 5 minutes of your time

## Step 1: Get Supabase Credentials (2 minutes)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. **Create a new project** (or use existing)
   - Name: WriterSquire
   - Database Password: Save this!
   - Region: Choose closest
   - Wait ~2 minutes for setup

3. **Get API Keys:**
   - Go to **Settings** → **API**
   - Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - Copy **anon public key** (the publishable key)

4. **Get Database Connection:**
   - Go to **Settings** → **Database**
   - Find **Connection string** section
   - Copy the **URI** connection string
   - Format: `postgresql://postgres.xxxxx:password@...`

## Step 2: Configure Environment Variables (1 minute)

### Backend (`backend/.env`)

Open `backend/.env` and update:

```env
# Database - Paste your Supabase PostgreSQL connection string here
DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-xx.pooler.supabase.com:6543/postgres?schema=public

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Supabase - Paste your values here
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_API_KEY=your-anon-public-key-here
```

### Frontend (`frontend/.env`)

Open `frontend/.env` and update:

```env
VITE_API_URL=http://localhost:3001

# Supabase - Same values as backend
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

## Step 3: Install & Setup (1 minute)

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup database
cd ../backend
npx prisma generate
npx prisma migrate dev --name init
```

## Step 4: Start Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 5: Test It! 🎉

1. Open http://localhost:5173
2. Click "Sign up" or go to `/register`
3. Create an account
4. You should be redirected to home page
5. ✅ **MVP is working!**

## Verify Everything Works

### Check Backend
- ✅ Server running on http://localhost:3001
- ✅ Health check: http://localhost:3001/api/health
- ✅ No errors in console

### Check Frontend
- ✅ Running on http://localhost:5173
- ✅ Can see login/register pages
- ✅ No errors in browser console

### Check Database
```bash
cd backend
npx prisma studio
```
- Opens http://localhost:5555
- Should see `users` table
- Your registered user should appear

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` files exist in both `backend/` and `frontend/`
- Verify all variables are filled in
- Restart servers after updating `.env`

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Make sure you copied the full connection string

### "Table does not exist"
- Run: `cd backend && npx prisma migrate dev --name init`

### Backend won't start
- Check console for specific error
- Verify PostgreSQL connection string
- Make sure Supabase project is ready

## What's Included in MVP

✅ **Authentication System**
- User registration
- User login
- JWT token management
- Protected routes
- OAuth ready (Google, GitHub)

✅ **User Management**
- User profiles
- Automatic user sync
- Session management

✅ **Database**
- PostgreSQL with Prisma
- User, World, Document models
- Relationships configured

✅ **Frontend**
- React 18 + TypeScript
- Tailwind CSS
- Routing
- Auth context

## Next Steps

Once MVP is working, you can build:
1. World creation (UC-001)
2. Character creation (UC-003)
3. Document creation (UC-101)
4. Spell checking (UC-103)

## Need Help?

- Check `MVP_SETUP_COMPLETE.md` for detailed guide
- Check `POSTGRESQL_MIGRATION.md` for database setup
- Check `SUPABASE_SETUP.md` for auth configuration

---

**Ready to build!** 🚀
