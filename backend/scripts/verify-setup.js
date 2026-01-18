// Verify complete setup
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

console.log('🔍 Verifying WriterSquire MVP Setup...\n');

let allGood = true;

// Check environment variables
console.log('📋 Environment Variables:');
const checks = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_API_KEY': process.env.SUPABASE_API_KEY,
};

for (const [key, value] of Object.entries(checks)) {
  if (value) {
    if (key === 'DATABASE_URL') {
      const isSupabase = value.includes('supabase') || value.includes('pooler');
      const isLocalhost = value.includes('localhost');
      if (isLocalhost && !isSupabase) {
        console.log(`  ⚠️  ${key}: Set (but pointing to localhost - should be Supabase)`);
        allGood = false;
      } else {
        console.log(`  ✅ ${key}: Set`);
      }
    } else {
      console.log(`  ✅ ${key}: Set`);
    }
  } else {
    console.log(`  ❌ ${key}: MISSING`);
    allGood = false;
  }
}

console.log('');

// Test Supabase
if (process.env.SUPABASE_URL && process.env.SUPABASE_API_KEY) {
  console.log('🔐 Testing Supabase...');
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);
    console.log('  ✅ Supabase client created');
  } catch (error) {
    console.log('  ❌ Supabase error:', error.message);
    allGood = false;
  }
}

console.log('');

// Test Database
if (process.env.DATABASE_URL) {
  console.log('🗄️  Testing PostgreSQL...');
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('  ✅ Database connection successful!');
    
    // Check if migrations have run
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'worlds', 'documents')
    `;
    
    if (tables.length === 3) {
      console.log('  ✅ All tables exist (migrations complete)');
    } else {
      console.log(`  ⚠️  Only ${tables.length}/3 tables found - migrations needed`);
      console.log('  💡 Run: npx prisma migrate dev --name init');
      allGood = false;
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.log('  ❌ Database connection failed:', error.message);
    if (error.message.includes('localhost')) {
      console.log('  💡 DATABASE_URL should point to Supabase, not localhost');
      console.log('  💡 Get connection string from: Supabase Dashboard → Settings → Database');
    }
    allGood = false;
  }
}

console.log('');

if (allGood) {
  console.log('✅ All checks passed! MVP is ready to run.');
  console.log('\n🚀 Start servers:');
  console.log('   Terminal 1: cd backend && npm run dev');
  console.log('   Terminal 2: cd frontend && npm run dev');
} else {
  console.log('⚠️  Some issues found. Please fix them before starting servers.');
}
