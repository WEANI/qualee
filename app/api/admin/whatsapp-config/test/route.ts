import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/whatsapp-cloud';

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
 * POST /api/admin/whatsapp-config/test
 * Teste la connexion WhatsApp d'un merchant
 * Body: { merchantId: string } ou { phoneNumberId, wabaId, accessToken }
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseAdmin();
    if (!client) return NextResponse.json({ error: 'Server error' }, { status: 500 });
    if (!(await verifyAdmin(request, client))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    let config;

    if (body.merchantId) {
      // Recuperer la config depuis la DB
      const { data, error } = await client
        .from('merchant_whatsapp_config')
        .select('phone_number_id, waba_id, access_token')
        .eq('merchant_id', body.merchantId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
      }
      config = data;
    } else {
      // Utiliser les credentials fournis directement
      config = {
        phone_number_id: body.phoneNumberId,
        waba_id: body.wabaId,
        access_token: body.accessToken,
      };
    }

    if (!config.waba_id || !config.access_token) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const result = await testConnection(config);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
