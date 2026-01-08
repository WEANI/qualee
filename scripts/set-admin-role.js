const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdminRole() {
  const email = 'sowaxcom@gmail.com';
  console.log(`🔍 Recherche de l'utilisateur ${email}...`);

  // 1. Get user ID by email (we can't list all easily, but we can try listUsers)
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Erreur listUsers:', error.message);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.error('❌ Utilisateur non trouvé.');
    return;
  }

  console.log(`✅ Utilisateur trouvé: ${user.id}`);
  console.log('📝 Mise à jour des metadata (role: "admin")...');

  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { app_metadata: { ...user.app_metadata, role: 'admin' } }
  );

  if (updateError) {
    console.error('❌ Erreur mise à jour:', updateError.message);
  } else {
    console.log('✅ Rôle admin attribué avec succès !');
    console.log('👤 App Metadata:', updatedUser.user.app_metadata);
  }
}

setAdminRole();
