-- ============================================================================
-- QUALEE - Migration 014: Correction colonne is_active
-- ============================================================================
-- Cette migration s'assure que la colonne is_active existe sur merchants
-- et corrige la politique RLS problématique sur redeemed_rewards
-- ============================================================================

-- Ajouter la colonne is_active si elle n'existe pas
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN merchants.is_active IS 'Indique si le compte marchand est actif';

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Public can insert redeemed rewards" ON redeemed_rewards;

-- Recréer la politique avec la gestion de NULL
CREATE POLICY "Public can insert redeemed rewards"
ON redeemed_rewards FOR INSERT
TO public
WITH CHECK (
    EXISTS (
        SELECT 1 FROM merchants
        WHERE merchants.id = redeemed_rewards.merchant_id
        AND (merchants.is_active = true OR merchants.is_active IS NULL)
        AND merchants.loyalty_enabled = true
    )
);

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
