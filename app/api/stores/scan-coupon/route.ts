import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST - Scan and validate coupon for cross-store redemption
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { coupon_code, store_id } = body;

    if (!coupon_code || !store_id) {
      return NextResponse.json({ error: 'Code coupon et magasin requis' }, { status: 400 });
    }

    // Get the coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select(`
        *,
        spin:spins (
          prize:prizes (name, image_url)
        )
      `)
      .eq('code', coupon_code.toUpperCase())
      .single();

    if (couponError || !coupon) {
      return NextResponse.json({
        error: 'Coupon non trouvé',
        valid: false,
        reason: 'not_found'
      }, { status: 404 });
    }

    // Check if already used
    if (coupon.used) {
      return NextResponse.json({
        error: 'Ce coupon a déjà été utilisé',
        valid: false,
        reason: 'already_used',
        used_at: coupon.used_at,
        redeemed_at_store_id: coupon.redeemed_at_store_id
      }, { status: 400 });
    }

    // Check expiration
    if (new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({
        error: 'Ce coupon a expiré',
        valid: false,
        reason: 'expired',
        expires_at: coupon.expires_at
      }, { status: 400 });
    }

    // Get the store being scanned at
    const { data: store } = await supabase
      .from('stores')
      .select(`
        *,
        organization:organizations (
          id, name, allow_cross_store_redemption
        )
      `)
      .eq('id', store_id)
      .single();

    if (!store) {
      return NextResponse.json({ error: 'Magasin non trouvé' }, { status: 404 });
    }

    // Check if user has access to this store
    const { data: org } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', store.organization_id)
      .single();

    const isOwner = org?.owner_id === user.id;
    let hasAccess = isOwner;

    if (!isOwner) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('can_scan_codes, store_ids')
        .eq('organization_id', store.organization_id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      hasAccess = membership?.can_scan_codes === true &&
        (!membership.store_ids || membership.store_ids.includes(store_id));
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès refusé à ce magasin' }, { status: 403 });
    }

    // Check cross-store redemption rules
    let canRedeem = false;
    let redeemMessage = '';

    // Same store where coupon was won
    if (coupon.won_at_store_id === store_id || coupon.merchant_id === store.merchant_id) {
      canRedeem = true;
      redeemMessage = 'Coupon valide - même magasin';
    }
    // Cross-store redemption
    else if (coupon.organization_id && coupon.organization_id === store.organization_id) {
      if (coupon.redeemable_at_any_store || store.organization?.allow_cross_store_redemption) {
        canRedeem = true;
        redeemMessage = 'Coupon valide - récupération inter-magasins';
      } else {
        return NextResponse.json({
          error: 'Ce coupon ne peut être utilisé que dans le magasin d\'origine',
          valid: false,
          reason: 'wrong_store',
          won_at_store_id: coupon.won_at_store_id
        }, { status: 400 });
      }
    }
    // Old-style single merchant coupon - check if same merchant
    else if (!coupon.organization_id && coupon.merchant_id === store.merchant_id) {
      canRedeem = true;
      redeemMessage = 'Coupon valide';
    }
    else {
      return NextResponse.json({
        error: 'Ce coupon appartient à une autre enseigne',
        valid: false,
        reason: 'wrong_organization'
      }, { status: 400 });
    }

    if (canRedeem) {
      return NextResponse.json({
        valid: true,
        message: redeemMessage,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          prize_name: coupon.prize_name,
          prize_image: coupon.spin?.prize?.image_url,
          expires_at: coupon.expires_at,
          won_at_store_id: coupon.won_at_store_id,
          is_cross_store: coupon.won_at_store_id !== store_id
        }
      });
    }

    return NextResponse.json({
      error: 'Coupon non valide',
      valid: false,
      reason: 'unknown'
    }, { status: 400 });
  } catch (error: any) {
    console.error('Error scanning coupon:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Mark coupon as redeemed
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { coupon_id, store_id } = body;

    if (!coupon_id || !store_id) {
      return NextResponse.json({ error: 'ID coupon et magasin requis' }, { status: 400 });
    }

    // Mark as used
    const { data: updated, error: updateError } = await supabase
      .from('coupons')
      .update({
        used: true,
        used_at: new Date().toISOString(),
        redeemed_at_store_id: store_id,
        redeemed_by_staff_id: user.id
      })
      .eq('id', coupon_id)
      .eq('used', false) // Extra safety check
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Coupon déjà utilisé ou non trouvé' }, { status: 400 });
      }
      throw updateError;
    }

    // Track the visit
    const { data: store } = await supabase
      .from('stores')
      .select('organization_id')
      .eq('id', store_id)
      .single();

    if (store) {
      await supabase.from('store_visits').insert({
        organization_id: store.organization_id,
        store_id: store_id,
        visit_type: 'redemption'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon marqué comme utilisé',
      coupon: updated
    });
  } catch (error: any) {
    console.error('Error redeeming coupon:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
