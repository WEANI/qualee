import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return supabaseAdmin;
}

async function verifyAdmin(request: NextRequest, client: SupabaseClient): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return false;

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  return adminEmails.includes(user.email?.toLowerCase() || '');
}

/**
 * GET /api/admin/whatsapp-config
 * Liste toutes les configs WhatsApp ou par merchantId
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    if (!client) return NextResponse.json({ error: 'Server error' }, { status: 500 });
    if (!(await verifyAdmin(request, client))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    let query = client
      .from('merchant_whatsapp_config')
      .select('*, merchant:merchants(id, business_name, email)');

    if (merchantId) {
      query = query.eq('merchant_id', merchantId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aussi lister les merchants sans config pour le dropdown
    const { data: allMerchants } = await client
      .from('merchants')
      .select('id, business_name, email')
      .order('business_name');

    const configuredIds = (data || []).map((c: any) => c.merchant_id);
    const unconfiguredMerchants = (allMerchants || []).filter(
      (m: any) => !configuredIds.includes(m.id)
    );

    return NextResponse.json({
      configs: data || [],
      unconfiguredMerchants,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/whatsapp-config
 * Cree une config WhatsApp pour un merchant
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    if (!client) return NextResponse.json({ error: 'Server error' }, { status: 500 });
    if (!(await verifyAdmin(request, client))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { merchantId, phoneNumberId, wabaId, accessToken, displayPhoneNumber } = body;

    if (!merchantId || !phoneNumberId || !wabaId || !accessToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await client
      .from('merchant_whatsapp_config')
      .insert({
        merchant_id: merchantId,
        phone_number_id: phoneNumberId,
        waba_id: wabaId,
        access_token: accessToken,
        display_phone_number: displayPhoneNumber || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ce merchant a deja une configuration WhatsApp' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/whatsapp-config
 * Modifie une config WhatsApp
 */
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    if (!client) return NextResponse.json({ error: 'Server error' }, { status: 500 });
    if (!(await verifyAdmin(request, client))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, phoneNumberId, wabaId, accessToken, displayPhoneNumber, isActive, messagePricePerUnit } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Update config
    const updates: Record<string, any> = {};
    if (phoneNumberId !== undefined) updates.phone_number_id = phoneNumberId;
    if (wabaId !== undefined) updates.waba_id = wabaId;
    if (accessToken !== undefined) updates.access_token = accessToken;
    if (displayPhoneNumber !== undefined) updates.display_phone_number = displayPhoneNumber;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await client
      .from('merchant_whatsapp_config')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update price on merchants table if provided
    if (messagePricePerUnit !== undefined && data) {
      await client
        .from('merchants')
        .update({ message_price_per_unit: messagePricePerUnit })
        .eq('id', data.merchant_id);
    }

    return NextResponse.json({ config: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/whatsapp-config
 * Supprime une config WhatsApp
 */
export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    if (!client) return NextResponse.json({ error: 'Server error' }, { status: 500 });
    if (!(await verifyAdmin(request, client))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await client
      .from('merchant_whatsapp_config')
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
