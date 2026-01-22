import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch user's organizations or specific organization
export async function GET(request: NextRequest) {
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
    const orgId = searchParams.get('id');

    if (orgId) {
      // Get specific organization with stores
      const { data: org, error } = await supabase
        .from('organizations')
        .select(`
          *,
          stores (*)
        `)
        .eq('id', orgId)
        .single();

      if (error) throw error;

      // Check access
      if (org.owner_id !== user.id) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('*')
          .eq('organization_id', orgId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (!membership) {
          return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }
      }

      return NextResponse.json({ organization: org });
    }

    // Get all user's organizations
    const { data: ownedOrgs, error: ownedError } = await supabase
      .from('organizations')
      .select(`
        *,
        stores (id, name, is_headquarters, is_active)
      `)
      .eq('owner_id', user.id);

    if (ownedError) throw ownedError;

    // Get organizations where user is a member
    const { data: memberships, error: memberError } = await supabase
      .from('organization_members')
      .select(`
        role,
        organization:organizations (
          *,
          stores (id, name, is_headquarters, is_active)
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (memberError) throw memberError;

    // Combine results
    const organizations = [
      ...ownedOrgs.map(org => ({ ...org, role: 'owner', is_owner: true })),
      ...memberships.map(m => ({ ...m.organization, role: m.role, is_owner: false }))
    ];

    return NextResponse.json({ organizations });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new organization
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
    const {
      name,
      slug,
      share_loyalty_cards = true,
      share_prizes = false,
      share_rewards = true,
      allow_cross_store_redemption = true,
      migrate_merchant_id // Optional: migrate existing merchant
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    // Create organization
    const { data: org, error: createError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug: finalSlug,
        owner_id: user.id,
        share_loyalty_cards,
        share_prizes,
        share_rewards,
        allow_cross_store_redemption,
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 400 });
      }
      throw createError;
    }

    // If migrating existing merchant, create headquarters store
    if (migrate_merchant_id) {
      const { data: merchant } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', migrate_merchant_id)
        .single();

      if (merchant) {
        await supabase
          .from('stores')
          .insert({
            organization_id: org.id,
            merchant_id: migrate_merchant_id,
            name: merchant.business_name || 'Magasin Principal',
            slug: 'principal',
            logo_url: merchant.logo_url,
            background_url: merchant.background_url,
            qr_code_url: merchant.qr_code_url,
            is_headquarters: true,
            google_review_link: merchant.google_review_link,
            google_maps_url: merchant.google_maps_url,
            wheel_bg_color: merchant.wheel_bg_color,
            segment_colors: merchant.segment_colors,
            unlucky_quantity: merchant.unlucky_quantity || 1,
            retry_quantity: merchant.retry_quantity || 1,
            prize_quantities: merchant.prize_quantities || {},
          });

        // Update merchant subscription
        await supabase
          .from('merchants')
          .update({ subscription_tier: 'multi-shop' })
          .eq('id', migrate_merchant_id);
      }
    }

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update organization
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
      return NextResponse.json({ error: 'ID organisation requis' }, { status: 400 });
    }

    // Check ownership
    const { data: org } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!org || org.owner_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Update organization
    const { data: updated, error: updateError } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ organization: updated });
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete organization
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
    const orgId = searchParams.get('id');

    if (!orgId) {
      return NextResponse.json({ error: 'ID organisation requis' }, { status: 400 });
    }

    // Check ownership
    const { data: org } = await supabase
      .from('organizations')
      .select('owner_id')
      .eq('id', orgId)
      .single();

    if (!org || org.owner_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Delete organization (cascade will delete stores, members, etc.)
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
