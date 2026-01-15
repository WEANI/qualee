-- ============================================================================
-- QUALEE - Script de correction base de données
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- ============================================================================

-- 1. Ajouter la colonne is_active si elle n'existe pas
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Ajouter les colonnes de fidélité si elles n'existent pas
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS loyalty_enabled BOOLEAN DEFAULT false;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS loyalty_card_image_url TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS points_per_purchase INTEGER DEFAULT 10;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS purchase_amount_threshold INTEGER DEFAULT 1000;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS loyalty_currency TEXT DEFAULT 'THB';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS welcome_points INTEGER DEFAULT 50;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS loyalty_message_template TEXT DEFAULT 'Bienvenue ! Votre carte fidélité est prête avec {{points}} points.';

-- 3. Ajouter redirect_strategy si elle n'existe pas
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS redirect_strategy TEXT DEFAULT 'google_maps';

-- 4. Mettre à jour tous les merchants existants pour avoir is_active = true
UPDATE merchants SET is_active = true WHERE is_active IS NULL;

-- 5. Supprimer et recréer les policies problématiques sur merchants
DROP POLICY IF EXISTS "Public can view active merchants" ON merchants;
DROP POLICY IF EXISTS "Merchants can view own profile" ON merchants;

-- Recréer les policies
CREATE POLICY "Public can view active merchants" ON merchants
  FOR SELECT
  USING (is_active = true OR is_active IS NULL);

CREATE POLICY "Merchants can view own profile" ON merchants
  FOR SELECT
  USING (auth.uid() = id);

-- 6. Vérifier que RLS est activé
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- 7. Vérification finale - Afficher les colonnes de merchants
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'merchants'
ORDER BY ordinal_position;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
