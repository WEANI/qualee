import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    );

    // Échanger le code contre une session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('[AUTH CALLBACK] Session exchange error:', sessionError);
      return NextResponse.redirect(`${origin}/auth/login?error=session_error`);
    }

    if (session?.user) {
      console.log('[AUTH CALLBACK] User authenticated:', session.user.email);

      // Vérifier si le profil marchand existe déjà
      const { data: existingMerchant, error: selectError } = await supabase
        .from('merchants')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (selectError) {
        console.error('[AUTH CALLBACK] Error checking merchant:', selectError);
      }

      if (!existingMerchant) {
        console.log('[AUTH CALLBACK] Creating merchant profile for:', session.user.id);

        // Créer le profil marchand avec les métadonnées de l'utilisateur
        const businessName = session.user.user_metadata?.business_name || 'Mon Commerce';

        const { error: merchantError } = await supabase.from('merchants').insert({
          id: session.user.id,
          email: session.user.email,
          business_name: businessName,
          subscription_tier: 'starter',
        });

        if (merchantError) {
          console.error('[AUTH CALLBACK] Merchant creation error:', merchantError);
          // Rediriger vers une page d'erreur ou le dashboard avec un message
          return NextResponse.redirect(`${origin}/dashboard?setup=pending`);
        } else {
          console.log('[AUTH CALLBACK] Merchant profile created successfully');
        }
      } else {
        console.log('[AUTH CALLBACK] Merchant already exists');
      }

      // Créer la réponse avec redirection
      const response = NextResponse.redirect(`${origin}/dashboard`);

      return response;
    }
  }

  // Si pas de code ou erreur, rediriger vers login
  console.log('[AUTH CALLBACK] No code or session, redirecting to login');
  return NextResponse.redirect(`${origin}/auth/login`);
}
