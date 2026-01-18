// Helper script to construct Supabase PostgreSQL connection string
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function getConnectionString() {
  console.log('🔗 Supabase PostgreSQL Connection String Helper\n');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl) {
    console.log(`✅ Found SUPABASE_URL: ${supabaseUrl}`);
    
    // Extract project ref from URL
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      const projectRef = match[1];
      console.log(`✅ Project Reference: ${projectRef}\n`);
      
      console.log('To get your connection string:');
      console.log('1. Go to: https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Go to Settings → Database');
      console.log('4. Find "Connection string" section');
      console.log('5. Copy the URI connection string\n');
      
      const hasPassword = await question('Do you have your database password? (y/n): ');
      
      if (hasPassword.toLowerCase() === 'y') {
        const password = await question('Enter your database password: ');
        const region = await question('Enter region (e.g., eu-central-1, us-east-1) or press Enter for default: ') || 'eu-central-1';
        
        // Construct connection string
        const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres?schema=public`;
        
        console.log('\n✅ Your DATABASE_URL:');
        console.log(connectionString);
        console.log('\n📋 Copy this to backend/.env as:');
        console.log(`DATABASE_URL=${connectionString}\n`);
        
        const save = await question('Would you like me to update backend/.env automatically? (y/n): ');
        if (save.toLowerCase() === 'y') {
          // Note: We can't directly write to .env from here, but we can show instructions
          console.log('\n⚠️  Please manually update backend/.env with the DATABASE_URL above.');
          console.log('Or run: echo "DATABASE_URL=' + connectionString + '" >> backend/.env\n');
        }
      } else {
        console.log('\n💡 To find your password:');
        console.log('1. Go to Supabase Dashboard → Settings → Database');
        console.log('2. Look for "Database password" or reset it if needed');
        console.log('3. The connection string shown there already includes the password\n');
      }
    }
  } else {
    console.log('⚠️  SUPABASE_URL not found in .env');
    console.log('Please set SUPABASE_URL in backend/.env first\n');
  }
  
  rl.close();
}

getConnectionString().catch(console.error);
