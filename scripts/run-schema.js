#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://egemjezgejptazoucwci.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZW1qZXpnZWpwdGF6b3Vjd2NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NjA1OSwiZXhwIjoyMDgyMzYyMDU5fQ.HJJStxiUl5BoGF6VFqWsDC6uFHKemB27A4fTVKCfgcI';

console.log('🚀 Qualee - Exécution automatique du schéma SQL\n');

// Lire le schéma SQL
const schemaPath = path.join(__dirname, '../supabase/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Diviser en statements individuels
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📝 ${statements.length} instructions SQL à exécuter\n`);

async function executeStatement(sql, index, total) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: hostname,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ [${index}/${total}] Exécuté avec succès`);
          resolve({ success: true });
        } else {
          console.log(`⚠️  [${index}/${total}] ${res.statusCode} - ${sql.substring(0, 50)}...`);
          resolve({ success: false, error: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ [${index}/${total}] Erreur:`, error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}

async function runSchema() {
  console.log('🔧 Connexion à Supabase...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const result = await executeStatement(statement, i + 1, statements.length);
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Petite pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log('='.repeat(50) + '\n');

  if (errorCount > 0) {
    console.log('⚠️  Certaines instructions ont échoué.');
    console.log('💡 Essayez d\'exécuter le schéma manuellement via le Dashboard Supabase:');
    console.log('   https://supabase.com/dashboard/project/egemjezgejptazoucwci/editor\n');
  } else {
    console.log('🎉 Base de données initialisée avec succès!\n');
    console.log('📊 Tables créées:');
    console.log('   ✓ merchants');
    console.log('   ✓ prizes');
    console.log('   ✓ feedback');
    console.log('   ✓ spins');
    console.log('   ✓ coupons');
    console.log('   ✓ qr_codes');
    console.log('   ✓ subscription_tiers\n');
    console.log('🔒 Row Level Security activée');
    console.log('📈 Indexes créés\n');
    console.log('🚀 Vous pouvez maintenant utiliser l\'application!');
    console.log('   http://localhost:3000\n');
  }
}

runSchema().catch(console.error);
