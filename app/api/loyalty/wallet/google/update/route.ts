import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getWalletIds, updatePassPoints } from '@/lib/google-wallet';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * POST /api/loyalty/wallet/google/update
 *
 * Met à jour le pass Google Wallet d'un client (points, achats)
 * Appelé automatiquement quand les points changent
 *
 * Body: {
 *   clientId: string (ID interne du client),
 *   points: number,
 *   totalPurchases?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { clientId, points, totalPurchases } = body;

    if (!clientId || points === undefined) {
      return NextResponse.json(
        { error: 'clientId and points are required' },
        { status: 400 }
      );
    }

    // Récupérer le client
    const { data: client, error: clientError } = await supabaseAdmin
      .from('loyalty_clients')
      .select('id, merchant_id, google_pass_id')
      .eq('id', clientId)
      .maybeSingle();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Construire l'objectId (même si google_pass_id n'est pas stocké)
    const { objectId } = getWalletIds(client.merchant_id, client.id);

    // Mettre à jour le pass
    const result = await updatePassPoints(objectId, points, totalPurchases);

    return NextResponse.json({
      success: result.success,
      objectId,
      error: result.error || undefined
    });

  } catch (error) {
    console.error('[GOOGLE WALLET UPDATE] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/loyalty/wallet/google/update
 *
 * Met à jour tous les passes d'un merchant (batch update)
 *
 * Body: {
 *   merchantId: string
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { merchantId } = body;

    if (!merchantId) {
      return NextResponse.json({ error: 'merchantId is required' }, { status: 400 });
    }

    // Récupérer tous les clients du merchant
    const { data: clients, error } = await supabaseAdmin
      .from('loyalty_clients')
      .select('id, points, total_purchases, merchant_id')
      .eq('merchant_id', merchantId)
      .eq('status', 'active');

    if (error || !clients) {
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    const results = { updated: 0, failed: 0, notFound: 0 };

    for (const client of clients) {
      const { objectId } = getWalletIds(client.merchant_id, client.id);
      const result = await updatePassPoints(objectId, client.points, client.total_purchases);

      if (result.success) {
        results.updated++;
      } else if (result.error?.includes('not found')) {
        results.notFound++;
      } else {
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      totalClients: clients.length,
      ...results
    });

  } catch (error) {
    console.error('[GOOGLE WALLET BATCH UPDATE] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
