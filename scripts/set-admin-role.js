const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://egemjezgejptazoucwci.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZW1qZXpnZWpwdGF6b3Vjd2NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NjA1OSwiZXhwIjoyMDgyMzYyMDU5fQ.HJJStxiUl5BoGF6VFqWsDC6uFHKemB27A4fTVKCfgcI';

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
