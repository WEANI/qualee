import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createTemplate, type WhatsAppConfig } from '@/lib/whatsapp-cloud';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

async function getMerchantId(request: NextRequest): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    // Try cookie-based auth
    const { searchParams } = new URL(request.url);
    return searchParams.get('merchantId');
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  return user?.id || null;
}

async function getWhatsAppConfig(merchantId: string): Promise<WhatsAppConfig | null> {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from('merchant_whatsapp_config')
    .select('phone_number_id, waba_id, access_token')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .maybeSingle();
  return data;
}

/**
 * GET /api/whatsapp/templates?merchantId=xxx
 * Liste les templates du merchant depuis la DB locale
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId') || await getMerchantId(request);

    if (!merchantId) {
      return NextResponse.json({ error: 'merchantId required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('whatsapp_templates')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check if WhatsApp is configured
    const config = await getWhatsAppConfig(merchantId);

    return NextResponse.json({
      templates: data || [],
      configured: !!config,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/whatsapp/templates
 * Cree un template sur Meta et le sauvegarde localement
 * Body: { merchantId, name, language, category, components }
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const body = await request.json();
    const { merchantId, name, language, category, components } = body;

    if (!merchantId || !name || !components) {
      return NextResponse.json({ error: 'merchantId, name, and components required' }, { status: 400 });
    }

    const config = await getWhatsAppConfig(merchantId);
    if (!config) {
      return NextResponse.json({ error: 'WhatsApp not configured for this merchant' }, { status: 400 });
    }

    // Creer sur Meta
    const result = await createTemplate(config, {
      name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      language: language || 'fr',
      category: category || 'MARKETING',
      components,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error, meta: true }, { status: 400 });
    }

    // Sauvegarder localement
    const { data, error } = await supabaseAdmin
      .from('whatsapp_templates')
      .upsert({
        merchant_id: merchantId,
        template_name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        language: language || 'fr',
        category: category || 'MARKETING',
        status: 'PENDING',
        components,
        meta_template_id: result.templateId,
        last_synced_at: new Date().toISOString(),
      }, { onConflict: 'merchant_id,template_name,language' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data, metaId: result.templateId });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
