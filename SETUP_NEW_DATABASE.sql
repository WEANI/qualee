-- ============================================================================
-- QUALEE - SCRIPT COMPLET POUR NOUVELLE BASE SUPABASE
-- ============================================================================
-- Ce fichier consolide tous les scripts SQL necessaires pour configurer
-- une nouvelle base de donnees Supabase pour le projet Qualee.
--
-- NOUVELLE BASE SUPABASE:
-- URL: https://btoqrsckxwvmvoipbyma.supabase.co
--
-- INSTRUCTIONS:
-- 1. Allez sur https://supabase.com/dashboard/project/btoqrsckxwvmvoipbyma/sql/new
-- 2. Copiez-collez ce script entier
-- 3. Cliquez sur "Run" pour executer
-- ============================================================================

-- ============================================================================
-- PARTIE 1: EXTENSIONS REQUISES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PARTIE 2: NETTOYAGE (Suppression des tables existantes si elles existent)
-- ============================================================================

DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS redeemed_rewards CASCADE;
DROP TABLE IF EXISTS points_transactions CASCADE;
DROP TABLE IF EXISTS loyalty_rewards CASCADE;
DROP TABLE IF EXISTS loyalty_clients CASCADE;
DROP TABLE IF EXISTS whatsapp_campaigns CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS spins CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS prizes CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS subscription_tiers CASCADE;

-- ============================================================================
-- PARTIE 3: CREATION DES TABLES PRINCIPALES
-- ============================================================================

-- 3.1 Table subscription_tiers (reference des abonnements)
CREATE TABLE subscription_tiers (
    tier_name TEXT PRIMARY KEY,
    max_locations INTEGER NOT NULL,
    price NUMERIC(8,2) NOT NULL,
    features JSONB DEFAULT '{}'::jsonb
);

-- 3.2 Table merchants (comptes marchands)
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    business_name TEXT,
    logo_url TEXT,
    background_url TEXT,
    qr_code_url TEXT,
    logo_background_color TEXT DEFAULT '#FFFFFF',
    branding JSONB DEFAULT '{}'::jsonb,

    -- Liens de redirection (avis)
    google_review_link TEXT,
    google_maps_url TEXT,
    tripadvisor_url TEXT,

    -- Reseaux sociaux
    instagram_handle TEXT,
    instagram_url TEXT,
    tiktok_handle TEXT,
    tiktok_url TEXT,

    -- Planning
    weekly_schedule TEXT,

    -- Stripe (paiements)
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_tier TEXT DEFAULT 'starter',

    -- Configuration de la roue
    unlucky_probability INTEGER DEFAULT 20,
    retry_probability INTEGER DEFAULT 10,
    unlucky_quantity INTEGER DEFAULT 1,
    retry_quantity INTEGER DEFAULT 1,
    prize_quantities JSONB DEFAULT '{}'::jsonb,

    -- Workflow WhatsApp
    workflow_mode TEXT DEFAULT 'web',
    whatsapp_message_template TEXT,
    whapi_api_key TEXT,

    -- Strategie de redirection
    redirect_strategy TEXT DEFAULT 'google_maps',

    -- Configuration fidelite
    loyalty_enabled BOOLEAN DEFAULT false,
    loyalty_card_image_url TEXT,
    points_per_purchase INTEGER DEFAULT 10,
    purchase_amount_threshold INTEGER DEFAULT 1000,
    loyalty_currency TEXT DEFAULT 'THB',
    welcome_points INTEGER DEFAULT 50,
    loyalty_message_template TEXT DEFAULT 'Bienvenue ! Votre carte fidelite est prete avec {{points}} points.',

    -- Langue preferee
    preferred_language TEXT DEFAULT 'fr',

    -- Statut
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Table prizes (lots de la roue)
CREATE TABLE prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    probability DOUBLE PRECISION NOT NULL CHECK (probability >= 0 AND probability <= 100),
    quantity INTEGER DEFAULT -1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Table feedback (avis clients)
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    is_positive BOOLEAN,
    user_token TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Table spins (tours de roue)
CREATE TABLE spins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    prize_id UUID REFERENCES prizes(id),
    ip_hash TEXT,
    user_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 Table coupons (bons de reduction generes)
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spin_id UUID REFERENCES spins(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    prize_name TEXT,
    expires_at TIMESTAMPTZ,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 Table qr_codes (QR codes des marchands)
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    asset_url TEXT,
    asset_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 Table notifications (notifications marchands)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.9 Table whatsapp_campaigns (campagnes WhatsApp)
CREATE TABLE whatsapp_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    main_message TEXT,
    cards JSONB DEFAULT '[]'::jsonb,
    is_favorite BOOLEAN DEFAULT false,
    send_count INTEGER DEFAULT 0,
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.10 Table contact_messages (messages de contact)
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    establishments TEXT,
    message TEXT,
    source TEXT DEFAULT 'contact_page',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PARTIE 4: TABLES DU SYSTEME DE FIDELITE
-- ============================================================================

-- 4.1 Table loyalty_clients (clients fidelite)
CREATE TABLE loyalty_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    card_id TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    email TEXT,
    birthday DATE,
    preferred_language TEXT DEFAULT 'fr',
    points INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0,
    qr_code_data TEXT UNIQUE NOT NULL,
    user_token TEXT,
    apple_pass_serial TEXT,
    google_pass_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
    last_visit TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Table points_transactions (transactions de points)
CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES loyalty_clients(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'welcome', 'adjustment')),
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    purchase_amount NUMERIC(12,2),
    description TEXT,
    reference_id UUID,
    staff_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 Table loyalty_rewards (recompenses fidelite)
CREATE TABLE loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('discount', 'product', 'service', 'cashback')),
    value TEXT NOT NULL,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    quantity_available INTEGER,
    image_url TEXT,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 Table redeemed_rewards (recompenses echangees)
CREATE TABLE redeemed_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES loyalty_clients(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES loyalty_rewards(id) ON DELETE SET NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    reward_name TEXT NOT NULL,
    reward_value TEXT NOT NULL,
    points_spent INTEGER NOT NULL,
    redemption_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    used_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PARTIE 5: INDEX POUR OPTIMISATION
-- ============================================================================

CREATE INDEX idx_feedback_merchant_id ON feedback(merchant_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_user_token ON feedback(user_token);
CREATE INDEX idx_feedback_customer_phone ON feedback(customer_phone);

CREATE INDEX idx_spins_merchant_id ON spins(merchant_id);
CREATE INDEX idx_spins_created_at ON spins(created_at DESC);
CREATE INDEX idx_spins_ip_hash ON spins(ip_hash);
CREATE INDEX idx_spins_user_token ON spins(user_token);

CREATE INDEX idx_coupons_merchant_id ON coupons(merchant_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_created_at ON coupons(created_at DESC);

CREATE INDEX idx_prizes_merchant_id ON prizes(merchant_id);
CREATE INDEX idx_qr_codes_merchant_id ON qr_codes(merchant_id);

CREATE INDEX idx_notifications_merchant_id ON notifications(merchant_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);

CREATE INDEX idx_whatsapp_campaigns_merchant_id ON whatsapp_campaigns(merchant_id);

CREATE INDEX idx_loyalty_clients_merchant_id ON loyalty_clients(merchant_id);
CREATE INDEX idx_loyalty_clients_phone ON loyalty_clients(phone);
CREATE INDEX idx_loyalty_clients_email ON loyalty_clients(email);
CREATE INDEX idx_loyalty_clients_qr_code ON loyalty_clients(qr_code_data);
CREATE INDEX idx_loyalty_clients_card_id ON loyalty_clients(card_id);

CREATE INDEX idx_points_transactions_client_id ON points_transactions(client_id);
CREATE INDEX idx_points_transactions_merchant_id ON points_transactions(merchant_id);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at DESC);

CREATE INDEX idx_loyalty_rewards_merchant_id ON loyalty_rewards(merchant_id);
CREATE INDEX idx_loyalty_rewards_is_active ON loyalty_rewards(is_active);

CREATE INDEX idx_redeemed_rewards_client_id ON redeemed_rewards(client_id);
CREATE INDEX idx_redeemed_rewards_merchant_id ON redeemed_rewards(merchant_id);
CREATE INDEX idx_redeemed_rewards_code ON redeemed_rewards(redemption_code);

CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ============================================================================
-- PARTIE 6: FONCTIONS ET TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at
    BEFORE UPDATE ON prizes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_campaigns_updated_at
    BEFORE UPDATE ON whatsapp_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_clients_updated_at
    BEFORE UPDATE ON loyalty_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_rewards_updated_at
    BEFORE UPDATE ON loyalty_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction generation card_id pour fidelite
CREATE OR REPLACE FUNCTION generate_loyalty_card_id(p_merchant_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_year TEXT;
    v_count INTEGER;
    v_card_id TEXT;
BEGIN
    v_year := EXTRACT(YEAR FROM NOW())::TEXT;
    SELECT COUNT(*) + 1 INTO v_count
    FROM loyalty_clients
    WHERE merchant_id = p_merchant_id
    AND card_id LIKE 'QLY-' || v_year || '-%';
    v_card_id := 'QLY-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
    RETURN v_card_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction generation redemption_code
CREATE OR REPLACE FUNCTION generate_redemption_code()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_code := 'RWD-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        SELECT EXISTS(SELECT 1 FROM redeemed_rewards WHERE redemption_code = v_code) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTIE 7: ACTIVATION DE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeemed_rewards ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PARTIE 8: POLITIQUES RLS (Row Level Security)
-- ============================================================================

-- Merchants
CREATE POLICY "Public can view active merchants" ON merchants FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Merchants can view own profile" ON merchants FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Merchants can update own profile" ON merchants FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users only" ON merchants FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Prizes
CREATE POLICY "Public can view prizes" ON prizes FOR SELECT TO public USING (EXISTS (SELECT 1 FROM merchants WHERE merchants.id = prizes.merchant_id AND merchants.is_active = true));
CREATE POLICY "Merchants can manage their prizes" ON prizes FOR ALL TO authenticated USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);

-- Feedback
CREATE POLICY "Public can insert feedback" ON feedback FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM merchants WHERE merchants.id = feedback.merchant_id AND merchants.is_active = true));
CREATE POLICY "Merchants can view their feedback" ON feedback FOR SELECT TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "allow_service_role_all_feedback" ON feedback FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Spins
CREATE POLICY "Public can insert spins" ON spins FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM merchants WHERE merchants.id = spins.merchant_id AND merchants.is_active = true));
CREATE POLICY "Merchants can view their spins" ON spins FOR SELECT TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Public can view spins by token" ON spins FOR SELECT TO public USING (true);

-- Coupons
CREATE POLICY "Public can insert coupons" ON coupons FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM merchants WHERE merchants.id = coupons.merchant_id AND merchants.is_active = true));
CREATE POLICY "Public can view coupons by code" ON coupons FOR SELECT TO public USING (true);
CREATE POLICY "Merchants can view their coupons" ON coupons FOR SELECT TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Merchants can update their coupons" ON coupons FOR UPDATE TO authenticated USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);

-- QR Codes
CREATE POLICY "Public can view qr_codes" ON qr_codes FOR SELECT TO public USING (true);
CREATE POLICY "Merchants can manage their qr_codes" ON qr_codes FOR ALL TO authenticated USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);

-- Notifications
CREATE POLICY "Merchants can view their own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Merchants can update their own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Merchants can delete their own notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Service role can insert notifications" ON notifications FOR INSERT TO service_role WITH CHECK (true);

-- WhatsApp Campaigns
CREATE POLICY "Merchants can view own campaigns" ON whatsapp_campaigns FOR SELECT TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Merchants can insert own campaigns" ON whatsapp_campaigns FOR INSERT TO authenticated WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Merchants can update own campaigns" ON whatsapp_campaigns FOR UPDATE TO authenticated USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Merchants can delete own campaigns" ON whatsapp_campaigns FOR DELETE TO authenticated USING (auth.uid() = merchant_id);

-- Subscription Tiers
CREATE POLICY "Public can view subscription_tiers" ON subscription_tiers FOR SELECT TO public USING (true);

-- Contact Messages
CREATE POLICY "Public can insert contact messages" ON contact_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service role full access contact_messages" ON contact_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Loyalty Clients
CREATE POLICY "Merchants can view their loyalty clients" ON loyalty_clients FOR SELECT TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Merchants can insert loyalty clients" ON loyalty_clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Merchants can update their loyalty clients" ON loyalty_clients FOR UPDATE TO authenticated USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Public can view loyalty client by qr_code" ON loyalty_clients FOR SELECT TO public USING (true);
CREATE POLICY "Service role full access loyalty_clients" ON loyalty_clients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public can update loyalty clients" ON loyalty_clients FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Points Transactions
CREATE POLICY "Merchants can view their points transactions" ON points_transactions FOR SELECT TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Merchants can insert points transactions" ON points_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Public can view transactions by client" ON points_transactions FOR SELECT TO public USING (true);
CREATE POLICY "Service role full access points_transactions" ON points_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Loyalty Rewards
CREATE POLICY "Merchants can manage their rewards" ON loyalty_rewards FOR ALL TO authenticated USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Public can view active rewards" ON loyalty_rewards FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Service role full access loyalty_rewards" ON loyalty_rewards FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Redeemed Rewards
CREATE POLICY "Merchants can view their redeemed rewards" ON redeemed_rewards FOR SELECT TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Merchants can manage their redeemed rewards" ON redeemed_rewards FOR ALL TO authenticated USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Public can view redeemed by code" ON redeemed_rewards FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert redeemed rewards" ON redeemed_rewards FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM merchants WHERE merchants.id = redeemed_rewards.merchant_id AND merchants.is_active = true AND merchants.loyalty_enabled = true));
CREATE POLICY "Service role full access redeemed_rewards" ON redeemed_rewards FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- PARTIE 9: DONNEES INITIALES
-- ============================================================================

INSERT INTO subscription_tiers (tier_name, max_locations, price, features) VALUES
    ('starter', 1, 15.00, '{"reviews": true, "wheel": true, "basic_analytics": true}'::jsonb),
    ('pro', 3, 59.00, '{"reviews": true, "wheel": true, "advanced_analytics": true, "whatsapp": true, "custom_branding": true, "loyalty": true}'::jsonb),
    ('multi-shop', -1, 99.00, '{"reviews": true, "wheel": true, "advanced_analytics": true, "whatsapp": true, "custom_branding": true, "loyalty": true, "unlimited_locations": true, "priority_support": true}'::jsonb)
ON CONFLICT (tier_name) DO UPDATE SET
    max_locations = EXCLUDED.max_locations,
    price = EXCLUDED.price,
    features = EXCLUDED.features;

-- ============================================================================
-- PARTIE 10: CREATION DU BUCKET STORAGE
-- ============================================================================
-- Note: Ces commandes doivent etre executees separement dans Supabase Dashboard
-- ou via l'API Storage. Elles ne fonctionnent pas dans l'editeur SQL standard.
--
-- Allez dans: Supabase Dashboard > Storage > New Bucket
-- Nom: merchant-assets
-- Public: Yes
-- ============================================================================

-- ============================================================================
-- VERIFICATION FINALE
-- ============================================================================

SELECT 'Tables creees:' as info;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT 'Configuration terminee avec succes!' as status;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
--
-- PROCHAINES ETAPES:
-- 1. Configurez le bucket Storage "merchant-assets" (public)
-- 2. Creez un utilisateur dans Authentication > Users
-- 3. Testez la connexion avec votre application
-- ============================================================================
