import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, parseWebhookStatuses } from '@/lib/whatsapp-cloud';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

/**
 * GET /api/whatsapp/webhook
 * Verification du webhook par Meta (handshake)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Reception des statuts de messages (sent, delivered, read, failed)
 */
export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();

    // Verifier la signature si app secret est configure
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (appSecret) {
      const signature = request.headers.get('x-hub-signature-256') || '';
      const valid = await verifyWebhookSignature(bodyText, signature, appSecret);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    const payload = JSON.parse(bodyText);
    const statuses = parseWebhookStatuses(payload);

    if (statuses.length === 0 || !supabaseAdmin) {
      return NextResponse.json({ received: true });
    }

    // Traiter chaque statut
    for (const status of statuses) {
      if (!status.wamid) continue;

      const updateData: Record<string, any> = { status: status.status };

      switch (status.status) {
        case 'sent':
          updateData.sent_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
          break;
        case 'delivered':
          updateData.delivered_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
          break;
        case 'read':
          updateData.read_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
          break;
        case 'failed':
          updateData.failed_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
          updateData.error_code = status.errorCode;
          updateData.error_message = status.errorMessage;
          break;
      }

      // Update le message
      const { data: msg } = await supabaseAdmin
        .from('campaign_messages')
        .update(updateData)
        .eq('wamid', status.wamid)
        .select('campaign_send_id')
        .maybeSingle();

      // Update les stats aggregees du campaign_send
      if (msg?.campaign_send_id) {
        const statField = `stats_${status.status}` as string;
        // Utiliser un increment via RPC ou recalculer
        const { data: allMessages } = await supabaseAdmin
          .from('campaign_messages')
          .select('status')
          .eq('campaign_send_id', msg.campaign_send_id);

        if (allMessages) {
          const counts = {
            stats_sent: allMessages.filter(m => m.status === 'sent').length,
            stats_delivered: allMessages.filter(m => m.status === 'delivered').length,
            stats_read: allMessages.filter(m => m.status === 'read').length,
            stats_failed: allMessages.filter(m => m.status === 'failed').length,
          };

          await supabaseAdmin
            .from('campaign_sends')
            .update(counts)
            .eq('id', msg.campaign_send_id);
        }
      }
    }

    return NextResponse.json({ received: true, processed: statuses.length });
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    // Always return 200 to prevent Meta from retrying
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}
