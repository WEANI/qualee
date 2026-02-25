import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service role client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * DELETE /api/prizes?id={prizeId}&merchantId={merchantId}
 *
 * Supprime un prix en neutralisant d'abord les FK dans spins/coupons
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prizeId = searchParams.get('id');
    const merchantId = searchParams.get('merchantId');

    if (!prizeId || !merchantId) {
      return NextResponse.json(
        { error: 'id et merchantId sont requis' },
        { status: 400 }
      );
    }

    // Verify the prize belongs to this merchant
    const { data: prize, error: prizeError } = await supabaseAdmin
      .from('prizes')
      .select('id, merchant_id')
      .eq('id', prizeId)
      .eq('merchant_id', merchantId)
      .maybeSingle();

    if (prizeError || !prize) {
      return NextResponse.json(
        { error: 'Prix introuvable ou non autorisé' },
        { status: 404 }
      );
    }

    // Nullify FK references in spins table
    await supabaseAdmin
      .from('spins')
      .update({ prize_id: null })
      .eq('prize_id', prizeId);

    // Delete the prize
    const { error: deleteError } = await supabaseAdmin
      .from('prizes')
      .delete()
      .eq('id', prizeId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Prize delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
