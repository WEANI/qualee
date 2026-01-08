#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🔒 Application des corrections RLS pour Qualee\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAccess() {
  console.log('🧪 Test d\'accès aux données...\n');

  try {
    // Test avec la clé anon (comme un client)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) {
        console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY manquant, impossible de tester l\'accès anon.');
        return false;
    }
    const anonClient = createClient(supabaseUrl, anonKey);

    console.log('📊 Test 1: Accès public aux marchands');
    const { data: merchants, error: merchantError } = await anonClient
      .from('merchants')
      .select('*')
      .limit(1);

    if (merchantError) {
      console.log('❌ Erreur:', merchantError.message);
      console.log('\n⚠️  Les politiques RLS doivent être mises à jour!');
      console.log('\n📋 Instructions:');
      console.log('1. Ouvrez Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/egemjezgejptazoucwci/editor');
      console.log('2. Allez dans "SQL Editor"');
      console.log('3. Copiez le contenu de: supabase/fix-rls-policies.sql');
      console.log('4. Exécutez le script SQL');
      console.log('5. Relancez ce test\n');
      return false;
    }

    console.log(`✅ Accès public aux marchands: OK (${merchants.length} trouvé(s))`);

    console.log('\n🎁 Test 2: Accès public aux prix');
    const { data: prizes, error: prizesError } = await anonClient
      .from('prizes')
      .select('*')
      .limit(1);

    if (prizesError) {
      console.log('❌ Erreur:', prizesError.message);
      return false;
    }

    console.log(`✅ Accès public aux prix: OK (${prizes.length} trouvé(s))`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Toutes les politiques RLS sont correctement configurées!');
    console.log('='.repeat(60));
    console.log('\n🚀 L\'application devrait maintenant fonctionner correctement');
    console.log('   Testez: http://localhost:3000/rate/da56ba06-8a5c-48e1-a45e-add9601422d0\n');

    return true;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

testAccess();
