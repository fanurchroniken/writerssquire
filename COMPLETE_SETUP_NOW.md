# 🚀 Complete Setup - Final Steps

## Current Status

✅ Frontend: Running on http://localhost:5173  
✅ Code: All compiles successfully  
✅ Supabase Auth: Configured  
⚠️ **DATABASE_URL**: Needs to be updated to Supabase PostgreSQL

## Quick Fix (2 minutes)

### Option 1: Use PowerShell Script (Easiest)

1. **Get your Supabase PostgreSQL connection string:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **Settings** → **Database**
   - Find **Connection string** section
   - Copy the **URI** connection string
   - It should look like:
     ```
     postgresql://postgres.xxxxx:your-password@aws-0-xx.pooler.supabase.com:6543/postgres
     ```
   - **Important**: Add `?schema=public` at the end if not present

2. **Run the setup script:**
   ```powershell
   cd backend
   .\scripts\setup-complete.ps1 -DatabaseUrl "postgresql://postgres.xxxxx:your-password@aws-0-xx.pooler.supabase.com:6543/postgres?schema=public"
   ```

   Replace the connection string with your actual one from Supabase.

### Option 2: Manual Update

1. **Get connection string** (same as above)

2. **Update `backend/.env`:**
   - Open `backend/.env`
   - Find the line: `DATABASE_URL=postgresql://user:password@localhost:5432/writerssquire`
   - Replace it with your Supabase connection string:
     ```env
     DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-xx.pooler.supabase.com:6543/postgres?schema=public
     ```

3. **Run setup:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   npm run build
   ```

## What the Setup Does

1. ✅ Updates DATABASE_URL (if using script)
2. ✅ Generates Prisma Client
3. ✅ Creates database tables (users, worlds, documents)
4. ✅ Builds backend
5. ✅ Verifies everything works

## After Setup

### Start Servers

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

(Already running on http://localhost:5173)

### Test Everything

1. **Backend Health**: http://localhost:3001/api/health
   - Should return: `{"status":"ok","message":"WriterSquire API is running"}`

2. **Frontend**: http://localhost:5173
   - Should show login page

3. **Register Account**:
   - Click "Sign up"
   - Create account
   - Should redirect to home page

4. **Verify Database**:
   ```bash
   cd backend
   npx prisma studio
   ```
   - Opens http://localhost:5555
   - Should see `users` table with your registered user

## Troubleshooting

### "Database connection failed"
- ✅ Check DATABASE_URL is correct
- ✅ Verify password is correct
- ✅ Make sure connection string includes `?schema=public`

### "Table does not exist"
- ✅ Run: `npx prisma migrate dev --name init`

### "Prisma Client not generated"
- ✅ Run: `npx prisma generate`

## Success Criteria

✅ Backend starts without errors  
✅ Frontend is accessible  
✅ Can register new account  
✅ User appears in database  
✅ Health endpoint returns OK  

---

**Once DATABASE_URL is updated, run the setup and you're done!** 🎉
