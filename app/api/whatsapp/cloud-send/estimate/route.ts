import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

/**
 * POST /api/whatsapp/cloud-send/estimate
 * Estime le cout d'une campagne
 * Body: { merchantId, recipientCount }
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const body = await request.json();
    const { merchantId, recipientCount } = body;

    if (!merchantId || !recipientCount) {
      return NextResponse.json({ error: 'merchantId and recipientCount required' }, { status: 400 });
    }

    // Recuperer le prix par message du merchant
    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('message_price_per_unit')
      .eq('id', merchantId)
      .maybeSingle();

    const pricePerMessage = merchant?.message_price_per_unit || 0.05;
    const totalCost = recipientCount * pricePerMessage;

    return NextResponse.json({
      recipientCount,
      pricePerMessage,
      totalCost: Math.round(totalCost * 100) / 100,
      currency: 'EUR',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
