-- ============================================================================
-- Migration: Add merchant profile fields
-- Description: Add contact and business information fields to merchants table
-- ============================================================================

-- Add profile fields to merchants table
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'France',
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS siret text;

-- Add comment for documentation
COMMENT ON COLUMN merchants.phone IS 'Phone number of the business';
COMMENT ON COLUMN merchants.address IS 'Street address of the business';
COMMENT ON COLUMN merchants.city IS 'City where the business is located';
COMMENT ON COLUMN merchants.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN merchants.country IS 'Country where the business is located';
COMMENT ON COLUMN merchants.website IS 'Business website URL';
COMMENT ON COLUMN merchants.siret IS 'SIRET number (French business identifier)';
