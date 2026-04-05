import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendTemplateMessage, type WhatsAppConfig } from '@/lib/whatsapp-cloud';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

/**
 * POST /api/whatsapp/cloud-send
 * Envoie une campagne WhatsApp via Cloud API
 * Body: {
 *   merchantId: string,
 *   templateName: string,
 *   language: string,
 *   recipientPhones: string[],
 *   components?: any[] (template variables),
 *   campaignId?: string (optional link to existing campaign)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const body = await request.json();
    const { merchantId, templateName, language, recipientPhones, components, campaignId } = body;

    if (!merchantId || !templateName || !language || !recipientPhones?.length) {
      return NextResponse.json({ error: 'merchantId, templateName, language, and recipientPhones required' }, { status: 400 });
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

    // Recuperer le prix
    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('message_price_per_unit')
      .eq('id', merchantId)
      .maybeSingle();

    const pricePerMessage = merchant?.message_price_per_unit || 0.05;
    const totalCost = recipientPhones.length * pricePerMessage;

    // Recuperer le template ID si disponible
    const { data: template } = await supabaseAdmin
      .from('whatsapp_templates')
      .select('id')
      .eq('merchant_id', merchantId)
      .eq('template_name', templateName)
      .eq('language', language)
      .maybeSingle();

    // Creer le campaign_send
    const { data: campaignSend, error: sendError } = await supabaseAdmin
      .from('campaign_sends')
      .insert({
        merchant_id: merchantId,
        campaign_id: campaignId || null,
        template_id: template?.id || null,
        template_name: templateName,
        recipient_count: recipientPhones.length,
        price_per_message: pricePerMessage,
        total_cost: totalCost,
        status: 'sending',
      })
      .select()
      .single();

    if (sendError || !campaignSend) {
      return NextResponse.json({ error: 'Failed to create campaign send' }, { status: 500 });
    }

    // Creer les messages individuels
    const messages = recipientPhones.map((phone: string) => ({
      campaign_send_id: campaignSend.id,
      merchant_id: merchantId,
      recipient_phone: phone,
      status: 'queued',
    }));

    await supabaseAdmin.from('campaign_messages').insert(messages);

    // Envoyer les messages (sequentiel avec delai)
    let sent = 0;
    let failed = 0;

    for (const phone of recipientPhones) {
      const result = await sendTemplateMessage(
        config as WhatsAppConfig,
        phone,
        templateName,
        language,
        components
      );

      const updateData: Record<string, any> = {};

      if (result.success) {
        sent++;
        updateData.status = 'sent';
        updateData.wamid = result.wamid;
        updateData.sent_at = new Date().toISOString();
      } else {
        failed++;
        updateData.status = 'failed';
        updateData.error_message = result.error;
        updateData.failed_at = new Date().toISOString();
      }

      // Update le message individuel
      await supabaseAdmin
        .from('campaign_messages')
        .update(updateData)
        .eq('campaign_send_id', campaignSend.id)
        .eq('recipient_phone', phone)
        .eq('status', 'queued');

      // Delai entre les messages (50ms)
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Mettre a jour le campaign_send
    await supabaseAdmin
      .from('campaign_sends')
      .update({
        status: failed === recipientPhones.length ? 'failed' : sent === recipientPhones.length ? 'completed' : 'partial',
        completed_at: new Date().toISOString(),
        stats_sent: sent,
        stats_failed: failed,
      })
      .eq('id', campaignSend.id);

    // Mettre a jour la facturation mensuelle
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const { data: existingBilling } = await supabaseAdmin
      .from('merchant_message_billing')
      .select('id, messages_sent, total_cost')
      .eq('merchant_id', merchantId)
      .eq('month', monthStart)
      .maybeSingle();

    if (existingBilling) {
      await supabaseAdmin
        .from('merchant_message_billing')
        .update({
          messages_sent: existingBilling.messages_sent + sent,
          total_cost: parseFloat(existingBilling.total_cost) + (sent * pricePerMessage),
        })
        .eq('id', existingBilling.id);
    } else {
      await supabaseAdmin
        .from('merchant_message_billing')
        .insert({
          merchant_id: merchantId,
          month: monthStart,
          messages_sent: sent,
          total_cost: sent * pricePerMessage,
        });
    }

    return NextResponse.json({
      success: true,
      campaignSendId: campaignSend.id,
      sent,
      failed,
      totalCost: Math.round(sent * pricePerMessage * 100) / 100,
    });
  } catch (error) {
    console.error('[CLOUD SEND] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
