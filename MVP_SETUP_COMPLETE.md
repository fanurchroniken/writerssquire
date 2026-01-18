# MVP Setup - Complete Guide

## 🎯 Goal: Get WriterSquire MVP Running

This guide will take you from zero to a working MVP with authentication.

## Prerequisites

- Node.js 20.x installed
- npm installed
- Supabase account (free tier works)
- PostgreSQL database (can use Supabase's built-in PostgreSQL)

## Step-by-Step Setup

### Step 1: Get Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project (or use existing)
3. Wait for project to be created (~2 minutes)
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (the publishable key)

6. Go to **Settings** → **Database**
7. Copy the **Connection String** (URI format)
   - Look for "Connection string" section
   - Use the "URI" format (not pooler)
   - Format: `postgresql://postgres.xxxxx:password@aws-0-xx.pooler.supabase.com:6543/postgres`

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
# Database - Use Supabase PostgreSQL connection string
DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-xx.pooler.supabase.com:6543/postgres?schema=public

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_API_KEY=your-anon-public-key-here
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:3001

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 4: Set Up Database

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# This will:
# - Create all database tables
# - Set up relationships
# - Generate Prisma Client
```

### Step 5: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ PostgreSQL connected via Prisma
✅ Database connection verified
🚀 Server running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 6: Test Authentication

1. Open http://localhost:5173
2. You should be redirected to `/login`
3. Click "Sign up" or go to `/register`
4. Create an account:
   - Email: your@email.com
   - Username: yourusername
   - Password: yourpassword
5. After registration, you should be redirected to home page
6. Check backend console - should see user sync message

### Step 7: Verify Database

```bash
cd backend

# Open Prisma Studio (database GUI)
npx prisma studio
```

This opens http://localhost:5555 where you can:
- View all tables
- See your registered users
- Verify data is being saved

## Troubleshooting

### Backend Won't Start

**Error: "Missing Supabase environment variables"**
- Check `backend/.env` exists
- Verify `SUPABASE_URL` and `SUPABASE_API_KEY` are set

**Error: "Database connection failed"**
- Check `DATABASE_URL` in `backend/.env`
- Verify PostgreSQL is accessible
- For Supabase: Make sure connection string is correct

**Error: "Table does not exist"**
- Run: `npx prisma migrate dev --name init`
- Or: `npx prisma migrate deploy`

### Frontend Won't Start

**Error: "Missing Supabase environment variables"**
- Check `frontend/.env` exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

**Error: "Cannot connect to API"**
- Make sure backend is running on port 3001
- Check `VITE_API_URL` in `frontend/.env`

### Authentication Issues

**"Invalid token" errors**
- Verify Supabase keys match in both `.env` files
- Check backend console for detailed errors
- Make sure you're using the **anon/public key** (not secret key)

**User not syncing to database**
- Check backend console for errors
- Verify database connection works
- Check Prisma Studio to see if user exists

## Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5173
- [ ] Can see login page
- [ ] Can register new account
- [ ] Can sign in
- [ ] User appears in database (check Prisma Studio)
- [ ] Protected routes work (redirects to login if not authenticated)

## What's Working in MVP

✅ **Authentication**
- User registration (email/password)
- User login
- OAuth (Google, GitHub) - if configured
- JWT token management
- Protected routes

✅ **User Management**
- User profiles
- User data sync from Supabase to PostgreSQL
- Session management

✅ **Database**
- PostgreSQL with Prisma ORM
- User, World, Document models ready
- Relationships configured

## Next Features to Build

1. **World Creation** (UC-001)
   - Create worlds
   - Manage world settings
   - World list view

2. **Character Creation** (UC-003)
   - Add characters to worlds
   - Character profiles

3. **Document Creation** (UC-101)
   - Rich text editor
   - Document management

4. **Spell Checking** (UC-103)
   - Multi-language support
   - Real-time checking

## Commands Reference

```bash
# Backend
cd backend
npm run dev              # Start dev server
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma Client

# Frontend
cd frontend
npm run dev              # Start dev server
npm run build            # Build for production
```

## Support

If you encounter issues:
1. Check console logs (backend and frontend)
2. Verify all environment variables are set
3. Check database connection
4. Review error messages carefully

---

**Status**: Ready for MVP development! 🚀
