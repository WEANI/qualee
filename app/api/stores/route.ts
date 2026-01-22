import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to check user access to organization
async function checkOrgAccess(userId: string, orgId: string) {
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', orgId)
    .single();

  if (org?.owner_id === userId) {
    return { hasAccess: true, role: 'owner' };
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  return { hasAccess: !!membership, role: membership?.role || null };
}

// GET - Fetch stores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('id');
    const orgId = searchParams.get('organizationId');
    const isPublic = searchParams.get('public') === 'true';

    // Public store info (for customer-facing pages)
    if (isPublic && storeId) {
      const { data: store, error } = await supabase
        .from('stores')
        .select(`
          id, name, slug, address, city, country,
          logo_url, background_url, qr_code_url,
          is_active, google_review_link, google_maps_url,
          wheel_bg_color, segment_colors, unlucky_quantity, retry_quantity, prize_quantities,
          organization:organizations (
            id, name, logo_url, primary_color, secondary_color,
            share_prizes, share_rewards, allow_cross_store_redemption
          )
        `)
        .eq('id', storeId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return NextResponse.json({ store });
    }

    // Authenticated requests
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (storeId) {
      // Get specific store
      const { data: store, error } = await supabase
        .from('stores')
        .select(`
          *,
          organization:organizations (*)
        `)
        .eq('id', storeId)
        .single();

      if (error) throw error;

      // Check access
      const { hasAccess } = await checkOrgAccess(user.id, store.organization_id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      return NextResponse.json({ store });
    }

    if (orgId) {
      // Get all stores for organization
      const { hasAccess } = await checkOrgAccess(user.id, orgId);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      const { data: stores, error } = await supabase
        .from('stores')
        .select('*')
        .eq('organization_id', orgId)
        .order('is_headquarters', { ascending: false })
        .order('name');

      if (error) throw error;
      return NextResponse.json({ stores });
    }

    // Get all stores user has access to
    const { data: userOrgs } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id);

    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id, store_ids')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const ownedOrgIds = userOrgs?.map(o => o.id) || [];
    const memberOrgIds = memberships?.map(m => m.organization_id) || [];
    const allOrgIds = [...new Set([...ownedOrgIds, ...memberOrgIds])];

    const { data: stores, error } = await supabase
      .from('stores')
      .select(`
        *,
        organization:organizations (id, name, slug)
      `)
      .in('organization_id', allOrgIds)
      .order('organization_id')
      .order('is_headquarters', { ascending: false })
      .order('name');

    if (error) throw error;
    return NextResponse.json({ stores });
  } catch (error: any) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new store
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
    const { organization_id, name, slug, ...storeData } = body;

    if (!organization_id || !name) {
      return NextResponse.json({ error: 'Organisation et nom requis' }, { status: 400 });
    }

    // Check access and max stores
    const { data: org } = await supabase
      .from('organizations')
      .select('owner_id, max_stores')
      .eq('id', organization_id)
      .single();

    if (!org || org.owner_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Count existing stores
    const { count } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id);

    if (count && count >= org.max_stores) {
      return NextResponse.json({
        error: `Limite atteinte: ${org.max_stores} magasins maximum`
      }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if first store (make it headquarters)
    const isFirstStore = count === 0;

    // Create store
    const { data: store, error: createError } = await supabase
      .from('stores')
      .insert({
        organization_id,
        name,
        slug: finalSlug,
        is_headquarters: isFirstStore,
        is_active: true,
        ...storeData
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') {
        return NextResponse.json({ error: 'Ce slug existe déjà dans cette organisation' }, { status: 400 });
      }
      throw createError;
    }

    return NextResponse.json({ store }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update store
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID magasin requis' }, { status: 400 });
    }

    // Get store and check access
    const { data: store } = await supabase
      .from('stores')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (!store) {
      return NextResponse.json({ error: 'Magasin non trouvé' }, { status: 404 });
    }

    const { hasAccess, role } = await checkOrgAccess(user.id, store.organization_id);
    if (!hasAccess || (role !== 'owner' && role !== 'admin')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Update store
    const { data: updated, error: updateError } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ store: updated });
  } catch (error: any) {
    console.error('Error updating store:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete store
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('id');

    if (!storeId) {
      return NextResponse.json({ error: 'ID magasin requis' }, { status: 400 });
    }

    // Get store and check access
    const { data: store } = await supabase
      .from('stores')
      .select('organization_id, is_headquarters')
      .eq('id', storeId)
      .single();

    if (!store) {
      return NextResponse.json({ error: 'Magasin non trouvé' }, { status: 404 });
    }

    // Check ownership (only owners can delete)
    const { data: org } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', store.organization_id)
      .single();

    if (!org || org.owner_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Cannot delete headquarters if other stores exist
    if (store.is_headquarters) {
      const { count } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', store.organization_id);

      if (count && count > 1) {
        return NextResponse.json({
          error: 'Impossible de supprimer le magasin principal. Transférez ce rôle à un autre magasin d\'abord.'
        }, { status: 400 });
      }
    }

    // Delete store
    const { error: deleteError } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting store:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
