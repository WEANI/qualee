import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { deleteTemplate, type WhatsAppConfig } from '@/lib/whatsapp-cloud';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

/**
 * DELETE /api/whatsapp/templates/[id]
 * Supprime un template sur Meta et localement
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const { id } = await params;

    // Recuperer le template
    const { data: template, error: fetchError } = await supabaseAdmin
      .from('whatsapp_templates')
      .select('*, merchant:merchants(id)')
      .eq('id', id)
      .single();

    if (fetchError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Recuperer la config WhatsApp
    const { data: config } = await supabaseAdmin
      .from('merchant_whatsapp_config')
      .select('phone_number_id, waba_id, access_token')
      .eq('merchant_id', template.merchant_id)
      .eq('is_active', true)
      .maybeSingle();

    if (config) {
      // Supprimer sur Meta
      const result = await deleteTemplate(config as WhatsAppConfig, template.template_name);
      if (!result.success) {
        console.error('[DELETE TEMPLATE] Meta error:', result.error);
        // Continue to delete locally even if Meta fails
      }
    }

    // Supprimer localement
    const { error } = await supabaseAdmin
      .from('whatsapp_templates')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
