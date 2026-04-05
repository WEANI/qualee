import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { listTemplates, type WhatsAppConfig } from '@/lib/whatsapp-cloud';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

/**
 * POST /api/whatsapp/templates/sync
 * Synchronise les templates depuis Meta vers la DB locale
 * Body: { merchantId }
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const body = await request.json();
    const { merchantId } = body;

    if (!merchantId) {
      return NextResponse.json({ error: 'merchantId required' }, { status: 400 });
    }

    // Recuperer la config WhatsApp
    const { data: config } = await supabaseAdmin
      .from('merchant_whatsapp_config')
      .select('phone_number_id, waba_id, access_token')
      .eq('merchant_id', merchantId)
      .eq('is_active', true)
      .maybeSingle();

    if (!config) {
      return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 400 });
    }

    // Lister les templates depuis Meta
    const result = await listTemplates(config as WhatsAppConfig);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Upsert chaque template dans la DB
    let synced = 0;
    let errors = 0;

    for (const template of result.templates) {
      const { error } = await supabaseAdmin
        .from('whatsapp_templates')
        .upsert({
          merchant_id: merchantId,
          template_name: template.name,
          language: template.language,
          category: template.category,
          status: template.status,
          components: template.components,
          meta_template_id: template.id,
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'merchant_id,template_name,language' });

      if (error) {
        errors++;
        console.error('[SYNC TEMPLATES] Error upserting:', template.name, error.message);
      } else {
        synced++;
      }
    }

    // Supprimer les templates locaux qui n'existent plus sur Meta
    const metaNames = result.templates.map(t => t.name);
    if (metaNames.length > 0) {
      await supabaseAdmin
        .from('whatsapp_templates')
        .delete()
        .eq('merchant_id', merchantId)
        .not('template_name', 'in', `(${metaNames.join(',')})`);
    }

    return NextResponse.json({
      success: true,
      synced,
      errors,
      total: result.templates.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
