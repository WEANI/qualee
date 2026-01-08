const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://egemjezgejptazoucwci.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZW1qZXpnZWpwdGF6b3Vjd2NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NjA1OSwiZXhwIjoyMDgyMzYyMDU5fQ.HJJStxiUl5BoGF6VFqWsDC6uFHKemB27A4fTVKCfgcI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSql() {
  console.log('🔄 Exécution du script de correction des données admin...');
  
  try {
    const sqlPath = path.join(__dirname, '..', 'FIX_ADMIN_DATA.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into separate statements to execute them one by one
    // We split by semicolon, but we need to be careful with the function definition which contains semicolons
    // A simple split might break the PL/PGSQL function. 
    // For this specific file, we can split by double newline as a rough heuristic or just try to run the whole block if the RPC supports it.
    // Let's try to run specific blocks that we know are safe.
    
    console.log('1. Insertion des utilisateurs manquants...');
    const insertSql = `
    INSERT INTO public.merchants (id, email, business_name, subscription_tier, created_at, is_active)
    SELECT 
      id, 
      email, 
      COALESCE(raw_user_meta_data->>'business_name', 'Nouveau Commerce'),
      COALESCE(raw_user_meta_data->>'subscription_tier', 'starter'),
      created_at,
      true
    FROM auth.users
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      business_name = CASE 
        WHEN merchants.business_name = 'Nouveau Commerce' THEN EXCLUDED.business_name 
        ELSE merchants.business_name 
      END;
    `;
    
    const { error: insertError } = await supabase.rpc('exec', { sql: insertSql });
    if (insertError) {
        console.error('❌ Erreur insertion:', insertError.message);
        if (insertError.message.includes('function "exec" does not exist')) {
            console.error('⚠️ La fonction RPC "exec" n\'existe pas. Veuillez exécuter le SQL manuellement via le dashboard Supabase.');
            return;
        }
    } else {
        console.log('✅ Insertion terminée.');
    }

    console.log('2. Création du trigger handle_new_user...');
    // Note: Creating functions/triggers via RPC might fail if not superuser or if specific permissions are missing.
    // We will try anyway.
    const triggerSql = `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER 
    SECURITY DEFINER
    SET search_path = public
    LANGUAGE plpgsql
    AS $$
    BEGIN
      INSERT INTO public.merchants (id, email, business_name, subscription_tier, is_active)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'business_name', 'Nouveau Commerce'),
        'starter',
        true
      )
      ON CONFLICT (id) DO NOTHING;
      
      RETURN NEW;
    END;
    $$;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW 
      EXECUTE FUNCTION public.handle_new_user();
    `;
    
    const { error: triggerError } = await supabase.rpc('exec', { sql: triggerSql });
    if (triggerError) {
        console.error('❌ Erreur création trigger:', triggerError.message);
    } else {
        console.log('✅ Trigger créé.');
    }

    console.log('3. Vérification des résultats...');
    const { data: merchants, error: fetchError } = await supabase
        .from('merchants')
        .select('id, email, business_name, is_active')
        .order('created_at', { ascending: false })
        .limit(5);

    if (fetchError) {
        console.error('❌ Erreur vérification:', fetchError.message);
    } else {
        console.log('📊 Derniers marchands :');
        console.table(merchants);
    }

  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message);
  }
}

executeSql();
