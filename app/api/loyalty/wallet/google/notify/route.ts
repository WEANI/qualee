import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getWalletIds, addMessageToLoyaltyObject, isGoogleWalletConfigured } from '@/lib/google-wallet';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * POST /api/loyalty/wallet/google/notify
 *
 * Envoie une notification/message à tous les passes Google Wallet d'un merchant
 *
 * Body: {
 *   merchantId: string,
 *   header: string,
 *   body: string,
 *   startDate?: string (ISO),
 *   endDate?: string (ISO)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!isGoogleWalletConfigured()) {
      return NextResponse.json({ error: 'Google Wallet not configured' }, { status: 400 });
    }

    const reqBody = await request.json();
    const { merchantId, header, body: messageBody, startDate, endDate } = reqBody;

    if (!merchantId || !header || !messageBody) {
      return NextResponse.json(
        { error: 'merchantId, header, and body are required' },
        { status: 400 }
      );
    }

    // Vérifier que le merchant existe
    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from('merchants')
      .select('id, business_name')
      .eq('id', merchantId)
      .maybeSingle();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Récupérer tous les clients actifs du merchant
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('loyalty_clients')
      .select('id, merchant_id, name, phone')
      .eq('merchant_id', merchantId)
      .eq('status', 'active');

    if (clientsError || !clients) {
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    const results = { sent: 0, failed: 0, notFound: 0 };

    for (const client of clients) {
      const { objectId } = getWalletIds(client.merchant_id, client.id);
      const result = await addMessageToLoyaltyObject(
        objectId,
        header,
        messageBody,
        startDate,
        endDate
      );

      if (result.success) {
        results.sent++;
      } else if (result.error?.includes('not found')) {
        results.notFound++;
      } else {
        results.failed++;
      }
    }

    // Sauvegarder la notification dans l'historique
    await supabaseAdmin
      .from('wallet_notifications')
      .insert({
        merchant_id: merchantId,
        header,
        body: messageBody,
        start_date: startDate || null,
        end_date: endDate || null,
        total_sent: results.sent,
        total_failed: results.failed,
        total_not_found: results.notFound,
      })
      .select()
      .maybeSingle();
    // Ignore error if table doesn't exist yet

    return NextResponse.json({
      success: true,
      merchantName: merchant.business_name,
      totalClients: clients.length,
      ...results
    });

  } catch (error) {
    console.error('[GOOGLE WALLET NOTIFY] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
