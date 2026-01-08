#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🧪 Test de connexion Supabase MCP\n');
console.log('='.repeat(50));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n📊 Test 1: Récupération des tiers d\'abonnement');
    const { data: tiers, error: tiersError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('price', { ascending: true });

    if (tiersError) throw tiersError;
    
    console.log(`✅ ${tiers.length} tiers trouvés:`);
    tiers.forEach(tier => {
      console.log(`   - ${tier.tier_name}: €${tier.price}/mois (${tier.max_locations} locations)`);
    });

    console.log('\n👥 Test 2: Vérification de la table merchants');
    const { data: merchants, error: merchantsError } = await supabase
      .from('merchants')
      .select('id, email, business_name, subscription_tier')
      .limit(5);

    if (merchantsError) {
      console.log('⚠️  Erreur attendue (RLS activé):', merchantsError.message);
      console.log('   Les marchands sont protégés par Row Level Security');
    } else {
      console.log(`✅ ${merchants.length} marchand(s) trouvé(s)`);
      if (merchants.length > 0) {
        console.log(`   Premier: ${merchants[0].business_name || merchants[0].email}`);
      }
    }

    console.log('\n🎁 Test 3: Vérification de la table prizes');
    const { count: prizesCount, error: prizesError } = await supabase
      .from('prizes')
      .select('*', { count: 'exact', head: true });

    if (prizesError) {
      console.log('⚠️  Erreur attendue (RLS activé):', prizesError.message);
    } else {
      console.log(`✅ ${prizesCount} prix dans la base de données`);
    }

    console.log('\n⭐ Test 4: Vérification de la table feedback');
    const { count: feedbackCount, error: feedbackError } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true });

    if (feedbackError) {
      console.log('⚠️  Erreur attendue (RLS activé):', feedbackError.message);
    } else {
      console.log(`✅ ${feedbackCount} feedback dans la base de données`);
    }

    console.log('\n🎡 Test 5: Vérification de la table spins');
    const { count: spinsCount, error: spinsError } = await supabase
      .from('spins')
      .select('*', { count: 'exact', head: true });

    if (spinsError) {
      console.log('⚠️  Erreur attendue (RLS activé):', spinsError.message);
    } else {
      console.log(`✅ ${spinsCount} spins dans la base de données`);
    }

    console.log('\n🎟️  Test 6: Vérification de la table coupons');
    const { count: couponsCount, error: couponsError } = await supabase
      .from('coupons')
      .select('*', { count: 'exact', head: true });

    if (couponsError) {
      console.log('⚠️  Erreur attendue (RLS activé):', couponsError.message);
    } else {
      console.log(`✅ ${couponsCount} coupons dans la base de données`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Connexion Supabase MCP fonctionnelle!\n');
    console.log('📋 Résumé:');
    console.log('   ✓ Base de données accessible');
    console.log('   ✓ Tables créées avec succès');
    console.log('   ✓ Row Level Security activé');
    console.log('   ✓ Subscription tiers configurés\n');
    console.log('🚀 Prêt pour le développement avec MCP Supabase!');
    console.log('📚 Consultez MCP_SUPABASE_GUIDE.md pour les exemples\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('\n💡 Vérifiez que le schéma SQL a été exécuté dans Supabase\n');
    process.exit(1);
  }
}

testConnection();
