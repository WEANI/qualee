#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🚀 Qualee - Supabase Database Setup\n');

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.from('_').select('*').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connected to Supabase successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function main() {
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\n⚠️  Could not verify connection.');
  }
  
  console.log('📋 Next steps:');
  console.log('');
  console.log('1. Open Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/egemjezgejptazoucwci');
  console.log('');
  console.log('2. Go to SQL Editor (left sidebar)');
  console.log('');
  console.log('3. Create a new query and paste the content from:');
  console.log('   supabase/schema.sql');
  console.log('');
  console.log('4. Run the query to create all tables');
  console.log('');
  console.log('5. Then run: npm run dev');
  console.log('');
  console.log('✨ Your Qualee database will be ready!');
}

main();
