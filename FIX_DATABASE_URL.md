# ⚠️ Important: Update DATABASE_URL

## Issue Detected

Your `DATABASE_URL` in `backend/.env` is currently pointing to **localhost** instead of **Supabase PostgreSQL**.

## Quick Fix

### Option 1: Use Supabase PostgreSQL (Recommended)

Since you're already using Supabase for authentication, use the same project's PostgreSQL database:

1. Go to **Supabase Dashboard** → Your Project
2. Go to **Settings** → **Database**
3. Scroll to **Connection string** section
4. Find **URI** format (not pooler)
5. Copy the connection string
6. It should look like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xx-central-1.pooler.supabase.com:6543/postgres
   ```

7. Update `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-xx.pooler.supabase.com:6543/postgres?schema=public
   ```

### Option 2: Use Direct Connection (Alternative)

If you prefer the direct connection (not pooler):

1. In Supabase Dashboard → Settings → Database
2. Use **Connection string** → **Direct connection** → **URI**
3. Format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

## After Updating

1. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

2. **Start backend:**
   ```bash
   npm run dev
   ```

## Verify It's Correct

The DATABASE_URL should:
- ✅ Contain `supabase` or `pooler.supabase.com`
- ✅ NOT contain `localhost:5432`
- ✅ Have your actual password (not placeholder)

## Current Status

- ✅ Supabase Auth: Configured
- ⚠️  Database URL: Needs update (pointing to localhost)
- ⚠️  Migrations: Waiting for correct DATABASE_URL

---

**Once DATABASE_URL is updated, run migrations and start the servers!**
