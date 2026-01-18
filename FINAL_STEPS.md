# ✅ Final Steps to Complete MVP Setup

## What's Done

✅ Frontend: Running on http://localhost:5173  
✅ Backend Code: All compiles successfully  
✅ Supabase Auth: Configured (SUPABASE_URL and SUPABASE_API_KEY set)  
✅ Prisma Schema: Complete  
⚠️ **DATABASE_URL**: Needs Supabase PostgreSQL connection string

## What You Need to Do (2 minutes)

### Step 1: Get Supabase PostgreSQL Connection String

1. Go to: https://app.supabase.com
2. Select your project (the one with URL: `https://hdilweurlremguvglkim.supabase.co`)
3. Click **Settings** (gear icon) → **Database**
4. Scroll to **Connection string** section
5. Click the **URI** tab
6. Copy the connection string
7. It will look like:
   ```
   postgresql://postgres.hdilweurlremguvglkim:YOUR-PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
   ```
8. **Add `?schema=public` at the end** if not present

### Step 2: Update backend/.env

Open `backend/.env` and find this line:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/writerssquire
```

Replace it with your Supabase connection string:
```env
DATABASE_URL=postgresql://postgres.hdilweurlremguvglkim:YOUR-PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?schema=public
```

**Important**: 
- Replace `YOUR-PASSWORD` with your actual Supabase database password
- Replace `REGION` with your region (e.g., `eu-central-1`, `us-east-1`)
- Keep `?schema=public` at the end

### Step 3: Run Setup Commands

Open PowerShell in the `backend` directory and run:

```powershell
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Build backend
npm run build
```

### Step 4: Start Backend Server

```powershell
npm run dev
```

You should see:
```
✅ PostgreSQL connected via Prisma
✅ Database connection verified
🚀 Server running on http://localhost:3001
```

### Step 5: Test Everything

1. **Backend Health**: http://localhost:3001/api/health
   - Should return: `{"status":"ok"}`

2. **Frontend**: http://localhost:5173 (already running)
   - Should show login page

3. **Register Account**:
   - Click "Sign up"
   - Create account
   - Should work!

4. **Verify Database**:
   ```powershell
   cd backend
   npx prisma studio
   ```
   - Opens http://localhost:5555
   - Should see your user in the `users` table

## Quick Reference

### Your Supabase Project
- **URL**: `https://hdilweurlremguvglkim.supabase.co`
- **Project Ref**: `hdilweurlremguvglkim`

### Connection String Format
```
postgresql://postgres.hdilweurlremguvglkim:YOUR-PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?schema=public
```

### Commands
```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run build
npm run dev
```

## Troubleshooting

### "Can't reach database server"
- ✅ Check DATABASE_URL is correct
- ✅ Verify password is correct
- ✅ Make sure connection string includes `?schema=public`

### "Table does not exist"
- ✅ Run: `npx prisma migrate dev --name init`

### "Prisma Client error"
- ✅ Run: `npx prisma generate`

## Success!

Once you see:
- ✅ Backend running on port 3001
- ✅ Frontend running on port 5173
- ✅ Can register/login
- ✅ User appears in database

**Your MVP is complete and working!** 🎉

---

**Next**: After MVP is working, you can start building features like world creation, character management, and document editing.
