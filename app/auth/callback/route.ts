import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Échanger le code contre une session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Session exchange error:', sessionError);
      return NextResponse.redirect(`${origin}/auth/login?error=session_error`);
    }

    if (session?.user) {
      // Utiliser le client admin pour bypasser RLS lors de la création
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Vérifier si le profil marchand existe déjà
      const { data: existingMerchant } = await supabaseAdmin
        .from('merchants')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!existingMerchant) {
        // Créer le profil marchand avec les métadonnées de l'utilisateur
        const businessName = session.user.user_metadata?.business_name || 'Mon Commerce';
        
        const { error: merchantError } = await supabaseAdmin.from('merchants').insert({
          id: session.user.id,
          email: session.user.email,
          business_name: businessName,
          subscription_tier: 'starter',
          is_active: true
        });

        if (merchantError) {
          console.error('Merchant creation error:', merchantError);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Si pas de code ou erreur, rediriger vers login
  return NextResponse.redirect(`${origin}/auth/login`);
}
