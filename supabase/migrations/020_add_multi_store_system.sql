-- Migration: Multi-Store System
-- Allows merchants to manage multiple stores under one organization
-- Supports shared/separate loyalty cards, prizes, and cross-store winner redemption

-- =============================================================================
-- 1. ORGANIZATIONS TABLE (Brand/Company level)
-- =============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (e.g., "cafe-paris")
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Multi-store settings
  share_loyalty_cards BOOLEAN DEFAULT true, -- Cards work across all stores
  share_prizes BOOLEAN DEFAULT false, -- Same prizes across all stores
  share_rewards BOOLEAN DEFAULT true, -- Loyalty rewards redeemable at any store
  allow_cross_store_redemption BOOLEAN DEFAULT true, -- Winners can redeem at any store

  -- Branding defaults (inherited by stores if not overridden)
  default_logo_url TEXT,
  default_background_url TEXT,
  primary_color TEXT DEFAULT '#7209B7',
  secondary_color TEXT DEFAULT '#EB1E99',

  -- Subscription
  subscription_tier TEXT DEFAULT 'multi-shop' CHECK (subscription_tier IN ('starter', 'pro', 'multi-shop')),
  max_stores INTEGER DEFAULT 10,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- =============================================================================
-- 2. STORES TABLE (Individual store/location)
-- =============================================================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL, -- Link to existing merchant

  -- Store info
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly (unique within organization)
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,

  -- Store-specific branding (overrides organization defaults if set)
  logo_url TEXT,
  background_url TEXT,
  qr_code_url TEXT,

  -- Store-specific settings
  is_active BOOLEAN DEFAULT true,
  is_headquarters BOOLEAN DEFAULT false, -- Main store flag

  -- Override organization sharing settings for this specific store
  use_shared_loyalty BOOLEAN DEFAULT true, -- Use org's shared loyalty cards
  use_shared_prizes BOOLEAN DEFAULT true, -- Use org's shared prizes
  use_shared_rewards BOOLEAN DEFAULT true, -- Use org's shared rewards

  -- Social links (store-specific)
  google_review_link TEXT,
  google_maps_url TEXT,
  tripadvisor_url TEXT,
  instagram_url TEXT,

  -- Wheel config (can be store-specific)
  wheel_bg_color TEXT DEFAULT '#4a4a52',
  segment_colors JSONB,
  unlucky_quantity INTEGER DEFAULT 1,
  retry_quantity INTEGER DEFAULT 1,
  prize_quantities JSONB DEFAULT '{}',

  -- Operating hours (JSONB for flexibility)
  operating_hours JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for slug within organization
  UNIQUE(organization_id, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stores_organization ON stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_stores_merchant ON stores(merchant_id);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(is_active);

-- =============================================================================
-- 3. ORGANIZATION MEMBERS (Staff/Managers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role-based access
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'staff')),

  -- Store-level permissions (NULL = all stores)
  store_ids UUID[] DEFAULT NULL, -- Array of store IDs this member can access

  -- Permissions flags
  can_manage_prizes BOOLEAN DEFAULT false,
  can_manage_loyalty BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT true,
  can_scan_codes BOOLEAN DEFAULT true,
  can_manage_staff BOOLEAN DEFAULT false,

  -- Metadata
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);

-- =============================================================================
-- 4. ORGANIZATION PRIZES (Shared prizes across stores)
-- =============================================================================
CREATE TABLE IF NOT EXISTS organization_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Prize info (similar to prizes table)
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),

  -- Availability
  is_active BOOLEAN DEFAULT true,
  quantity INTEGER, -- NULL = unlimited

  -- Store restrictions (NULL = all stores)
  available_at_stores UUID[] DEFAULT NULL, -- Array of store IDs where this prize is available
  redeemable_at_stores UUID[] DEFAULT NULL, -- Array of store IDs where this prize can be redeemed

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_prizes_org ON organization_prizes(organization_id);

-- =============================================================================
-- 5. ORGANIZATION REWARDS (Shared loyalty rewards)
-- =============================================================================
CREATE TABLE IF NOT EXISTS organization_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Reward info (similar to loyalty_rewards)
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('discount', 'product', 'service', 'cashback')),
  value TEXT NOT NULL,
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),

  -- Availability
  is_active BOOLEAN DEFAULT true,
  quantity_available INTEGER, -- NULL = unlimited

  -- Store restrictions
  redeemable_at_stores UUID[] DEFAULT NULL, -- NULL = all stores

  -- Validity
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,

  -- Metadata
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_rewards_org ON organization_rewards(organization_id);

-- =============================================================================
-- 6. CROSS-STORE COUPONS (Enhanced coupons for multi-store)
-- =============================================================================
-- Add new columns to existing coupons table
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS won_at_store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS redeemed_at_store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS redeemable_at_any_store BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS redeemed_by_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_coupons_org ON coupons(organization_id);
CREATE INDEX IF NOT EXISTS idx_coupons_store ON coupons(store_id);

-- =============================================================================
-- 7. CROSS-STORE LOYALTY CLIENTS (Enhanced for multi-store)
-- =============================================================================
-- Add organization support to loyalty_clients
ALTER TABLE loyalty_clients
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS home_store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS registered_at_store_id UUID REFERENCES stores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_loyalty_clients_org ON loyalty_clients(organization_id);

-- =============================================================================
-- 8. CROSS-STORE REDEEMED REWARDS (Enhanced)
-- =============================================================================
ALTER TABLE redeemed_rewards
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS redeemed_at_store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organization_reward_id UUID REFERENCES organization_rewards(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_redeemed_rewards_org ON redeemed_rewards(organization_id);

-- =============================================================================
-- 9. STORE VISITS TRACKING
-- =============================================================================
CREATE TABLE IF NOT EXISTS store_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  loyalty_client_id UUID REFERENCES loyalty_clients(id) ON DELETE SET NULL,

  -- Visit info
  visit_type TEXT CHECK (visit_type IN ('spin', 'loyalty_scan', 'redemption', 'feedback')),
  user_token TEXT,
  ip_hash TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_visits_org ON store_visits(organization_id);
CREATE INDEX IF NOT EXISTS idx_store_visits_store ON store_visits(store_id);
CREATE INDEX IF NOT EXISTS idx_store_visits_client ON store_visits(loyalty_client_id);
CREATE INDEX IF NOT EXISTS idx_store_visits_date ON store_visits(created_at);

-- =============================================================================
-- 10. FEEDBACK ENHANCEMENT FOR MULTI-STORE
-- =============================================================================
ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_org ON feedback(organization_id);
CREATE INDEX IF NOT EXISTS idx_feedback_store ON feedback(store_id);

-- =============================================================================
-- 11. SPINS ENHANCEMENT FOR MULTI-STORE
-- =============================================================================
ALTER TABLE spins
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organization_prize_id UUID REFERENCES organization_prizes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_spins_org ON spins(organization_id);
CREATE INDEX IF NOT EXISTS idx_spins_store ON spins(store_id);

-- =============================================================================
-- 12. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Organizations RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners can manage their organizations"
  ON organizations FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Organization members can view their organizations"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Stores RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners can manage stores"
  ON stores FOR ALL
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "Organization members can view their stores"
  ON stores FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Public can view active stores"
  ON stores FOR SELECT
  USING (is_active = true);

-- Organization Members RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners can manage members"
  ON organization_members FOR ALL
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "Members can view their membership"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());

-- Organization Prizes RLS
ALTER TABLE organization_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners can manage org prizes"
  ON organization_prizes FOR ALL
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "Public can view active org prizes"
  ON organization_prizes FOR SELECT
  USING (is_active = true);

-- Organization Rewards RLS
ALTER TABLE organization_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners can manage org rewards"
  ON organization_rewards FOR ALL
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "Public can view active org rewards"
  ON organization_rewards FOR SELECT
  USING (is_active = true);

-- Store Visits RLS
ALTER TABLE store_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners can view store visits"
  ON store_visits FOR SELECT
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "Public can insert store visits"
  ON store_visits FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- 13. HELPER FUNCTIONS
-- =============================================================================

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations(user_uuid UUID)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  role TEXT,
  is_owner BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id as organization_id,
    o.name as organization_name,
    COALESCE(om.role, 'owner') as role,
    (o.owner_id = user_uuid) as is_owner
  FROM organizations o
  LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = user_uuid
  WHERE o.owner_id = user_uuid
     OR (om.user_id = user_uuid AND om.is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get stores user has access to
CREATE OR REPLACE FUNCTION get_user_stores(user_uuid UUID)
RETURNS TABLE (
  store_id UUID,
  store_name TEXT,
  organization_id UUID,
  organization_name TEXT,
  role TEXT,
  is_headquarters BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as store_id,
    s.name as store_name,
    s.organization_id,
    o.name as organization_name,
    COALESCE(om.role, 'owner') as role,
    s.is_headquarters
  FROM stores s
  JOIN organizations o ON s.organization_id = o.id
  LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = user_uuid
  WHERE s.is_active = true
    AND (
      o.owner_id = user_uuid
      OR (om.user_id = user_uuid AND om.is_active = true
          AND (om.store_ids IS NULL OR s.id = ANY(om.store_ids)))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if coupon can be redeemed at store
CREATE OR REPLACE FUNCTION can_redeem_coupon_at_store(coupon_uuid UUID, store_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  coupon_record RECORD;
  store_record RECORD;
BEGIN
  SELECT * INTO coupon_record FROM coupons WHERE id = coupon_uuid;
  SELECT * INTO store_record FROM stores WHERE id = store_uuid;

  IF coupon_record IS NULL OR store_record IS NULL THEN
    RETURN false;
  END IF;

  -- Already redeemed
  IF coupon_record.used THEN
    RETURN false;
  END IF;

  -- Expired
  IF coupon_record.expires_at < NOW() THEN
    RETURN false;
  END IF;

  -- Same store as won
  IF coupon_record.won_at_store_id = store_uuid THEN
    RETURN true;
  END IF;

  -- Cross-store redemption enabled
  IF coupon_record.redeemable_at_any_store THEN
    -- Must be same organization
    IF coupon_record.organization_id = store_record.organization_id THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 14. UPDATED_AT TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_prizes_updated_at
  BEFORE UPDATE ON organization_prizes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_rewards_updated_at
  BEFORE UPDATE ON organization_rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 15. MIGRATION HELPER: Link existing merchants to new system
-- =============================================================================
-- This function helps migrate existing single-store merchants to the multi-store system
-- Call this manually for merchants who want to upgrade to multi-store

CREATE OR REPLACE FUNCTION migrate_merchant_to_multistore(merchant_uuid UUID, org_name TEXT)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
  new_store_id UUID;
  merchant_record RECORD;
BEGIN
  -- Get merchant data
  SELECT * INTO merchant_record FROM merchants WHERE id = merchant_uuid;

  IF merchant_record IS NULL THEN
    RAISE EXCEPTION 'Merchant not found';
  END IF;

  -- Create organization
  INSERT INTO organizations (
    name,
    slug,
    owner_id,
    default_logo_url,
    default_background_url
  ) VALUES (
    org_name,
    LOWER(REPLACE(org_name, ' ', '-')) || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
    merchant_uuid,
    merchant_record.logo_url,
    merchant_record.background_url
  ) RETURNING id INTO new_org_id;

  -- Create headquarters store
  INSERT INTO stores (
    organization_id,
    merchant_id,
    name,
    slug,
    logo_url,
    background_url,
    qr_code_url,
    is_headquarters,
    google_review_link,
    google_maps_url,
    wheel_bg_color,
    segment_colors,
    unlucky_quantity,
    retry_quantity,
    prize_quantities
  ) VALUES (
    new_org_id,
    merchant_uuid,
    merchant_record.business_name,
    'main',
    merchant_record.logo_url,
    merchant_record.background_url,
    merchant_record.qr_code_url,
    true,
    merchant_record.google_review_link,
    merchant_record.google_maps_url,
    merchant_record.wheel_bg_color,
    merchant_record.segment_colors,
    merchant_record.unlucky_quantity,
    merchant_record.retry_quantity,
    merchant_record.prize_quantities
  ) RETURNING id INTO new_store_id;

  -- Update merchant's subscription tier
  UPDATE merchants SET subscription_tier = 'multi-shop' WHERE id = merchant_uuid;

  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION migrate_merchant_to_multistore IS
'Migrates an existing single-store merchant to multi-store system.
Usage: SELECT migrate_merchant_to_multistore(''merchant-uuid'', ''My Brand Name'');';
