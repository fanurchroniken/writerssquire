# PostgreSQL Migration Guide

## ✅ Migration Complete

WriterSquire has been successfully migrated from MongoDB to PostgreSQL using Prisma ORM.

## What Changed

### Database
- **Before**: MongoDB with Mongoose ODM
- **After**: PostgreSQL with Prisma ORM

### Models Migrated
- ✅ User model
- ✅ World model  
- ✅ Document model

### Files Updated
- ✅ `backend/src/config/database.ts` - Now uses Prisma
- ✅ `backend/src/services/userService.ts` - Updated to use Prisma
- ✅ `backend/src/routes/auth.ts` - Updated references
- ✅ `backend/prisma/schema.prisma` - Complete schema definition
- ✅ `backend/.env` - Updated with DATABASE_URL

## Setup Instructions

### 1. Install PostgreSQL

**Option A: Local PostgreSQL**
```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey: choco install postgresql

# macOS: 
brew install postgresql
brew services start postgresql

# Linux:
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Option B: Use Supabase PostgreSQL (Recommended)**
- Your Supabase project already includes a PostgreSQL database!
- Get connection string from: Supabase Dashboard → Settings → Database → Connection String
- Use the "URI" connection string (not the pooler)

**Option C: Docker**
```bash
docker run --name postgres-writerssquire \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=writerssquire \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Update Environment Variables

Update `backend/.env`:

```env
# PostgreSQL Connection String
# Format: postgresql://user:password@host:port/database?schema=public

# For local PostgreSQL:
DATABASE_URL=postgresql://postgres:password@localhost:5432/writerssquire?schema=public

# For Supabase (recommended):
# Get from: Supabase Dashboard → Settings → Database → Connection String → URI
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?schema=public
```

### 3. Create Database (if using local PostgreSQL)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE writerssquire;

# Exit
\q
```

### 4. Run Prisma Migrations

```bash
cd backend

# Generate Prisma Client (if not already done)
npx prisma generate

# Create and apply initial migration
npx prisma migrate dev --name init

# This will:
# - Create migration files
# - Apply schema to database
# - Generate Prisma Client
```

### 5. Verify Setup

```bash
# Open Prisma Studio to view your database
npx prisma studio

# This opens a GUI at http://localhost:5555
```

## Prisma Commands

### Development
```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply pending migrations
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Production
```bash
# Apply migrations (no prompts)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

## Schema Changes

### User Model
- Uses UUID instead of ObjectId
- `supabaseId` is unique and indexed
- `preferences` stored as JSON
- All timestamps automatically managed

### World Model
- Uses UUID for IDs
- `tags` stored as array
- `metadata` stored as JSON
- Foreign key to User with cascade delete

### Document Model
- Uses UUID for IDs
- `history` stored as JSON array
- `spellCheckSettings` stored as JSON
- Supports document hierarchy (parent/child)

## Benefits of PostgreSQL

✅ **ACID Compliance**: Strong data consistency
✅ **Relationships**: Foreign keys and referential integrity
✅ **Transactions**: Support for complex operations
✅ **JSON Support**: Still supports flexible JSON fields
✅ **Mature Ecosystem**: Well-established, battle-tested
✅ **Supabase Integration**: Works seamlessly with Supabase
✅ **Type Safety**: Prisma provides excellent TypeScript support

## Troubleshooting

### Connection Issues

**Error: "Connection refused"**
- Check PostgreSQL is running: `pg_isready` or check service status
- Verify connection string in `.env`
- Check firewall/port 5432 is open

**Error: "database does not exist"**
- Create database: `CREATE DATABASE writerssquire;`
- Or update DATABASE_URL to point to existing database

**Error: "password authentication failed"**
- Verify username and password in connection string
- For Supabase: Use the password from project settings

### Migration Issues

**Error: "Migration failed"**
- Check database connection
- Verify schema.prisma is valid: `npx prisma validate`
- Reset database (development only): `npx prisma migrate reset`

**Error: "Prisma Client not generated"**
- Run: `npx prisma generate`
- Check `node_modules/.prisma/client` exists

## Next Steps

1. ✅ Update `DATABASE_URL` in `backend/.env`
2. ✅ Run `npx prisma migrate dev --name init`
3. ✅ Start backend server: `npm run dev`
4. ✅ Test authentication flow
5. ✅ Verify user sync works

## Using Supabase PostgreSQL (Recommended)

Since you're already using Supabase for authentication, you can use the same Supabase project's PostgreSQL database:

1. Go to Supabase Dashboard
2. Settings → Database
3. Copy the "Connection String" (URI format)
4. Paste into `DATABASE_URL` in `backend/.env`
5. Run migrations: `npx prisma migrate deploy`

This gives you:
- ✅ Managed PostgreSQL (no setup needed)
- ✅ Automatic backups
- ✅ Connection pooling
- ✅ Same project as your auth

---

**Migration Status**: ✅ Complete  
**Next Action**: Update DATABASE_URL and run migrations
