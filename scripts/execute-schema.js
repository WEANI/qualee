#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🚀 Qualee - Exécution du schéma SQL\n');

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

async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      return { error };
    }

    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

async function executeSchemaDirect() {
  console.log('📝 Lecture du fichier schema.sql...\n');
  
  const schemaPath = path.join(__dirname, '../supabase/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Utilisation de l'API REST de Supabase directement
  console.log('🔧 Exécution du schéma via l\'API Supabase...\n');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      }
    });

    console.log('✅ Connexion à Supabase établie\n');
    console.log('⚠️  Pour exécuter le schéma SQL complet, vous devez :');
    console.log('');
    console.log('1. Ouvrir le Dashboard Supabase :');
    console.log('   https://supabase.com/dashboard/project/egemjezgejptazoucwci/editor');
    console.log('');
    console.log('2. Aller dans "SQL Editor"');
    console.log('');
    console.log('3. Créer une nouvelle query');
    console.log('');
    console.log('4. Copier-coller le contenu de : supabase/schema.sql');
    console.log('');
    console.log('5. Cliquer sur "Run" (ou Ctrl+Enter)');
    console.log('');
    console.log('📋 Le schéma créera automatiquement :');
    console.log('   ✓ 7 tables (merchants, prizes, feedback, spins, coupons, qr_codes, subscription_tiers)');
    console.log('   ✓ Indexes pour les performances');
    console.log('   ✓ Row Level Security (RLS) policies');
    console.log('   ✓ Triggers pour les timestamps');
    console.log('');
    console.log('💡 Alternative : Utilisez la Supabase CLI');
    console.log('   npm install -g supabase');
    console.log('   supabase login');
    console.log('   supabase link --project-ref egemjezgejptazoucwci');
    console.log('   supabase db push');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

executeSchemaDirect();
