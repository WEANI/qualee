
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMerchant() {
  const id = 'a864ab66-13b2-4b8c-bca6-9d66c651f9a2';
  console.log(`Checking merchant with ID: ${id}`);
  
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Count:', data.length);
    console.log('Data:', data);
  }
  
  // Also check using .maybeSingle() to verify the fix
  console.log('Testing .maybeSingle()...');
  const { data: singleData, error: singleError } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (singleError) {
    console.log('Single Error:', singleError);
  } else {
    console.log('Single Data:', singleData);
  }
}

checkMerchant();
