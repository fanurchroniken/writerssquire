# 🎯 START HERE - WriterSquire MVP

## Welcome!

This guide will get you from zero to a **working MVP** in about 5 minutes.

## What You'll Get

✅ **Full Authentication System**
- User registration & login
- JWT token management
- Protected routes
- OAuth ready (Google, GitHub)

✅ **PostgreSQL Database**
- User management
- Ready for worlds, documents, characters
- Prisma ORM for type-safe queries

✅ **React Frontend**
- Modern UI with Tailwind CSS
- Routing & navigation
- Auth context & protected routes

## Quick Start (5 Minutes)

### 1. Get Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create new project → Wait ~2 minutes
3. **Settings → API**: Copy Project URL and anon public key
4. **Settings → Database**: Copy PostgreSQL connection string (URI format)

### 2. Update Environment Files

**`backend/.env`:**
```env
DATABASE_URL=postgresql://postgres.xxxxx:password@...  # From Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_API_KEY=your-anon-public-key
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**`frontend/.env`:**
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Install & Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup database
cd ../backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Servers

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

### 5. Test It!

1. Open http://localhost:5173
2. Register a new account
3. ✅ **You're done!**

## Need More Details?

- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **Complete Guide**: [MVP_SETUP_COMPLETE.md](./MVP_SETUP_COMPLETE.md)
- **Troubleshooting**: See guides above

## What's Next?

Once MVP is working:
1. ✅ Authentication - **DONE**
2. 🎯 World Creation (UC-001)
3. 🎯 Character Creation (UC-003)
4. 🎯 Document Creation (UC-101)
5. 🎯 Spell Checking (UC-103)

---

**Ready? Let's go!** 🚀
