// Complete setup automation script
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

console.log('🚀 WriterSquire MVP - Complete Setup\n');

// Check prerequisites
console.log('📋 Checking prerequisites...\n');

const checks = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_API_KEY': process.env.SUPABASE_API_KEY,
};

let allSet = true;
for (const [key, value] of Object.entries(checks)) {
  if (value) {
    if (key === 'DATABASE_URL') {
      const isSupabase = value.includes('supabase') || value.includes('pooler');
      if (isSupabase) {
        console.log(`  ✅ ${key}: Set (Supabase)`);
      } else {
        console.log(`  ⚠️  ${key}: Set (but not Supabase - may need update)`);
      }
    } else {
      console.log(`  ✅ ${key}: Set`);
    }
  } else {
    console.log(`  ❌ ${key}: MISSING`);
    allSet = false;
  }
}

if (!allSet) {
  console.log('\n⚠️  Some environment variables are missing.');
  console.log('Please ensure backend/.env has all required variables.\n');
  process.exit(1);
}

console.log('\n✅ All environment variables are set!\n');

// Step 1: Generate Prisma Client
console.log('📦 Step 1: Generating Prisma Client...');
try {
  execSync('npx prisma generate', { 
    cwd: join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('  ✅ Prisma Client generated\n');
} catch (error) {
  console.error('  ❌ Failed to generate Prisma Client');
  process.exit(1);
}

// Step 2: Test database connection
console.log('🔌 Step 2: Testing database connection...');
try {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  await prisma.$disconnect();
  console.log('  ✅ Database connection successful\n');
} catch (error) {
  console.error('  ❌ Database connection failed:', error.message);
  console.error('\n💡 Make sure:');
  console.error('   1. DATABASE_URL is correct in backend/.env');
  console.error('   2. Database is accessible');
  console.error('   3. Password is correct\n');
  process.exit(1);
}

// Step 3: Check if migrations needed
console.log('🗄️  Step 3: Checking database tables...');
try {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.$connect();
  
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'worlds', 'documents')
  `;
  
  await prisma.$disconnect();
  
  if (tables.length === 3) {
    console.log('  ✅ All tables exist (migrations already run)\n');
  } else {
    console.log(`  ⚠️  Only ${tables.length}/3 tables found`);
    console.log('  📝 Running migrations...\n');
    
    try {
      execSync('npx prisma migrate dev --name init', {
        cwd: join(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log('\n  ✅ Migrations completed\n');
    } catch (error) {
      console.error('\n  ❌ Migrations failed');
      process.exit(1);
    }
  }
} catch (error) {
  console.error('  ❌ Error checking tables:', error.message);
  process.exit(1);
}

// Step 4: Build backend
console.log('🔨 Step 4: Building backend...');
try {
  execSync('npm run build', {
    cwd: join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('  ✅ Backend built successfully\n');
} catch (error) {
  console.error('  ❌ Build failed');
  process.exit(1);
}

console.log('✅ Setup complete! MVP is ready.\n');
console.log('🚀 Start servers:');
console.log('   Terminal 1: cd backend && npm run dev');
console.log('   Terminal 2: cd frontend && npm run dev\n');
console.log('📊 Test endpoints:');
console.log('   Backend: http://localhost:3001/api/health');
console.log('   Frontend: http://localhost:5173\n');
