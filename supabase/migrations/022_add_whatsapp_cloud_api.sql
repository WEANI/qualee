-- Migration 022: WhatsApp Business Cloud API
-- Ajoute les tables pour credentials, templates, campagnes et facturation

-- 1. Credentials WhatsApp par merchant
CREATE TABLE IF NOT EXISTS merchant_whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  phone_number_id TEXT NOT NULL,
  waba_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  display_phone_number TEXT,
  business_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id)
);

-- RLS: service_role only (tokens sensibles)
ALTER TABLE merchant_whatsapp_config ENABLE ROW LEVEL SECURITY;
-- Pas de policy pour authenticated => uniquement accessible via service_role

-- 2. Cache local des templates Meta
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'fr',
  category TEXT NOT NULL DEFAULT 'MARKETING',
  status TEXT NOT NULL DEFAULT 'PENDING',
  components JSONB NOT NULL DEFAULT '[]',
  meta_template_id TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, template_name, language)
);

ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own templates"
  ON whatsapp_templates FOR SELECT
  USING (merchant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_merchant ON whatsapp_templates(merchant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_status ON whatsapp_templates(merchant_id, status);

-- 3. Envois de campagne
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES whatsapp_campaigns(id) ON DELETE SET NULL,
  template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  template_name TEXT NOT NULL,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  price_per_message NUMERIC(10,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'sending',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  stats_sent INTEGER DEFAULT 0,
  stats_delivered INTEGER DEFAULT 0,
  stats_read INTEGER DEFAULT 0,
  stats_failed INTEGER DEFAULT 0,
  stats_clicked INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own campaign sends"
  ON campaign_sends FOR SELECT
  USING (merchant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_campaign_sends_merchant ON campaign_sends(merchant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_date ON campaign_sends(sent_at DESC);

-- 4. Messages individuels par destinataire
CREATE TABLE IF NOT EXISTS campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_send_id UUID NOT NULL REFERENCES campaign_sends(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  recipient_phone TEXT NOT NULL,
  wamid TEXT,
  status TEXT DEFAULT 'queued',
  error_code TEXT,
  error_message TEXT,
  clicked_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own campaign messages"
  ON campaign_messages FOR SELECT
  USING (merchant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_campaign_messages_send ON campaign_messages(campaign_send_id);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_wamid ON campaign_messages(wamid);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_status ON campaign_messages(campaign_send_id, status);

-- 5. Facturation mensuelle
CREATE TABLE IF NOT EXISTS merchant_message_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  total_cost NUMERIC(12,4) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, month)
);

ALTER TABLE merchant_message_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own billing"
  ON merchant_message_billing FOR SELECT
  USING (merchant_id = auth.uid());

-- 6. Opt-in WhatsApp sur loyalty_clients
ALTER TABLE loyalty_clients ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT false;
ALTER TABLE loyalty_clients ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at TIMESTAMPTZ;

-- Backfill: les clients existants avec un phone ont deja scanne le QR = opt-in
UPDATE loyalty_clients
SET whatsapp_opt_in = true, whatsapp_opt_in_at = created_at
WHERE phone IS NOT NULL AND whatsapp_opt_in = false;

-- 7. Prix par message sur merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS message_price_per_unit NUMERIC(10,4) DEFAULT 0.0500;

-- Triggers auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_merchant_whatsapp_config_updated') THEN
    CREATE TRIGGER trigger_merchant_whatsapp_config_updated
      BEFORE UPDATE ON merchant_whatsapp_config
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_whatsapp_templates_updated') THEN
    CREATE TRIGGER trigger_whatsapp_templates_updated
      BEFORE UPDATE ON whatsapp_templates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
