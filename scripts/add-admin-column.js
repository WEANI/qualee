const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSql() {
  console.log('🔄 Ajout de la colonne is_admin...');
  
  try {
    // 1. Add column
    const alterSql = `
      ALTER TABLE public.merchants 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
    `;
    
    console.log('1. Modification de la structure de table...');
    const { error: alterError } = await supabase.rpc('exec', { sql: alterSql });
    if (alterError) {
        console.error('❌ Erreur alter:', alterError.message);
        if (alterError.message.includes('function "exec" does not exist')) {
            console.error('⚠️ Impossible d\'exécuter via RPC. Veuillez exécuter ADD_ADMIN_COLUMN.sql manuellement.');
            return;
        }
    } else {
        console.log('✅ Structure mise à jour.');
    }

    // 2. Set admin
    console.log('2. Configuration de l\'administrateur (sowaxcom@gmail.com)...');
    const updateSql = `
      UPDATE public.merchants 
      SET is_admin = true 
      WHERE email = 'sowaxcom@gmail.com';
    `;
    
    const { error: updateError } = await supabase.rpc('exec', { sql: updateSql });
    if (updateError) {
        console.error('❌ Erreur update:', updateError.message);
    } else {
        console.log('✅ Administrateur configuré.');
    }

    // 3. Verify
    console.log('3. Vérification...');
    const { data: admins, error: fetchError } = await supabase
        .from('merchants')
        .select('id, email, is_admin')
        .eq('is_admin', true);

    if (fetchError) {
        // If column doesn't exist yet for the select, this might fail if step 1 failed silently or wasn't immediate?
        // But usually it should be fine if RPC worked.
        console.error('❌ Erreur vérification:', fetchError.message);
    } else {
        console.log('👑 Administrateurs :');
        console.table(admins);
    }

  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message);
  }
}

executeSql();
