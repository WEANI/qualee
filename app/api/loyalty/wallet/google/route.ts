import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Vérification des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service role client pour bypass RLS
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Google Wallet constants
const GOOGLE_WALLET_SAVE_URL = 'https://pay.google.com/gp/v/save';

/**
 * GET /api/loyalty/wallet/google
 *
 * Génère un lien Google Wallet pour ajouter la carte de fidélité
 *
 * Query params:
 * - clientId: UUID du client fidélité (qr_code_data)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier que Supabase est configuré
    if (!supabaseAdmin) {
      console.error('[GOOGLE WALLET] Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // Récupérer le client par son qr_code_data
    const { data: client, error: clientError } = await supabaseAdmin
      .from('loyalty_clients')
      .select('*')
      .eq('qr_code_data', clientId)
      .maybeSingle();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Récupérer les infos du merchant
    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from('merchants')
      .select('id, business_name, logo_url, loyalty_card_image_url, background_url')
      .eq('id', client.merchant_id)
      .maybeSingle();

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    // Vérifier si Google Wallet est configuré
    const googleIssuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    const googleServiceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
    const googlePrivateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY;

    if (!googleIssuerId || !googleServiceAccountEmail || !googlePrivateKey) {
      return NextResponse.json({
        configured: false,
        message: 'Google Wallet not configured. Please set the following environment variables:',
        requiredEnvVars: [
          'GOOGLE_WALLET_ISSUER_ID',
          'GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL',
          'GOOGLE_WALLET_PRIVATE_KEY'
        ],
        debug: {
          hasIssuerId: !!googleIssuerId,
          hasEmail: !!googleServiceAccountEmail,
          hasKey: !!googlePrivateKey
        }
      });
    }

    // Debug: log key format info (sans exposer la clé)
    console.log('[GOOGLE WALLET] Key info:', {
      issuerId: googleIssuerId,
      email: googleServiceAccountEmail,
      keyLength: googlePrivateKey.length,
      keyStart: googlePrivateKey.substring(0, 30),
      hasBeginMarker: googlePrivateKey.includes('-----BEGIN'),
      hasNewlines: googlePrivateKey.includes('\n'),
      hasEscapedNewlines: googlePrivateKey.includes('\\n'),
    });

    // Créer les IDs uniques
    const classId = `${googleIssuerId}.qualee_loyalty_${merchant.id.replace(/-/g, '_')}`;
    const objectId = `${googleIssuerId}.qualee_card_${client.id.replace(/-/g, '_')}`;

    // LoyaltyClass (template pour tous les passes du merchant)
    const loyaltyClass = {
      id: classId,
      issuerName: 'Qualee',
      programName: `${merchant.business_name} - Fidélité`,
      programLogo: {
        sourceUri: {
          uri: merchant.logo_url || 'https://qualee.netlify.app/logo.png'
        },
        contentDescription: {
          defaultValue: {
            language: 'fr',
            value: merchant.business_name || 'Logo'
          }
        }
      },
      hexBackgroundColor: '#f59e0b',
      reviewStatus: 'UNDER_REVIEW',
      countryCode: 'TH',
      classTemplateInfo: {
        cardTemplateOverride: {
          cardRowTemplateInfos: [
            {
              twoItems: {
                startItem: {
                  firstValue: {
                    fields: [
                      {
                        fieldPath: 'object.loyaltyPoints.balance.int'
                      }
                    ]
                  }
                },
                endItem: {
                  firstValue: {
                    fields: [
                      {
                        fieldPath: 'object.textModulesData[\'purchases\']'
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    };

    // Ajouter l'image hero si disponible
    const heroImageUrl = merchant.loyalty_card_image_url || merchant.background_url;
    if (heroImageUrl) {
      (loyaltyClass as any).heroImage = {
        sourceUri: {
          uri: heroImageUrl
        },
        contentDescription: {
          defaultValue: {
            language: 'fr',
            value: `${merchant.business_name} Carte Fidélité`
          }
        }
      };
    }

    // LoyaltyObject (instance pour ce client spécifique)
    const loyaltyObject = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      accountId: client.card_id,
      accountName: client.name || 'Client fidèle',
      loyaltyPoints: {
        label: 'Points',
        balance: {
          int: client.points || 0
        }
      },
      barcode: {
        type: 'QR_CODE',
        value: client.qr_code_data,
        alternateText: client.card_id
      },
      textModulesData: [
        {
          id: 'card_id',
          header: 'N° Carte',
          body: client.card_id
        },
        {
          id: 'purchases',
          header: 'Achats',
          body: `${client.total_purchases || 0}`
        },
        {
          id: 'member_since',
          header: 'Membre depuis',
          body: client.created_at
            ? new Date(client.created_at).toLocaleDateString('fr-FR')
            : new Date().toLocaleDateString('fr-FR')
        }
      ],
      linksModuleData: {
        uris: [
          {
            uri: `https://qualee.netlify.app/card/${client.qr_code_data}`,
            description: 'Voir ma carte en ligne',
            id: 'card_link'
          }
        ]
      }
    };

    // Créer le JWT pour le lien "Add to Google Wallet"
    const claims = {
      iss: googleServiceAccountEmail,
      aud: 'google',
      origins: ['https://qualee.netlify.app'],
      typ: 'savetowallet',
      payload: {
        loyaltyClasses: [loyaltyClass],
        loyaltyObjects: [loyaltyObject]
      }
    };

    // Décoder la clé privée selon le format stocké dans les env vars
    let privateKey = googlePrivateKey;

    // Remplacer les \n échappés littéraux
    privateKey = privateKey.replace(/\\n/g, '\n');

    // Si c'est du base64 (pas de BEGIN marker)
    if (!privateKey.includes('-----BEGIN')) {
      try {
        privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
      } catch {
        // pas du base64, on continue
      }
    }

    // Si la clé contient BEGIN mais est sur une seule ligne (pas de vrais \n entre les sections)
    // Reconstruire le format PEM correct
    if (privateKey.includes('-----BEGIN') && !privateKey.includes('\n-----')) {
      // La clé est probablement condensée, essayer de la reformater
      privateKey = privateKey
        .replace(/-----BEGIN (.*?)-----/g, '-----BEGIN $1-----\n')
        .replace(/-----END (.*?)-----/g, '\n-----END $1-----')
        .replace(/(.{64})(?!-)/g, '$1\n');
    }

    console.log('[GOOGLE WALLET] Key diagnostic:', {
      length: privateKey.length,
      hasBegin: privateKey.includes('-----BEGIN'),
      hasEnd: privateKey.includes('-----END'),
      lineCount: privateKey.split('\n').length,
      firstLine: privateKey.split('\n')[0],
      lastLine: privateKey.split('\n').slice(-1)[0],
    });

    // Vérifier que la clé est valide
    if (!privateKey.includes('-----BEGIN')) {
      console.error('[GOOGLE WALLET] Invalid private key format');
      return NextResponse.json(
        { error: 'Invalid private key configuration', hint: 'Encode the key in base64: base64 -i key.pem' },
        { status: 500 }
      );
    }

    // Signer le JWT
    const token = jwt.sign(claims, privateKey, {
      algorithm: 'RS256'
    });

    // Générer le lien Google Wallet
    const saveUrl = `${GOOGLE_WALLET_SAVE_URL}/${token}`;

    return NextResponse.json({
      configured: true,
      saveUrl,
      passData: {
        cardId: client.card_id,
        points: client.points,
        merchantName: merchant.business_name,
        classId,
        objectId
      }
    });

  } catch (error) {
    console.error('[GOOGLE WALLET] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : '';
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
        hint: errorMessage.includes('PEM') || errorMessage.includes('key')
          ? 'Private key format issue. Check GOOGLE_WALLET_PRIVATE_KEY env var.'
          : errorMessage.includes('jwt') || errorMessage.includes('sign')
          ? 'JWT signing failed. Check private key and service account.'
          : 'Check server logs for details.',
        stack: process.env.NODE_ENV !== 'production' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/wallet/google
 *
 * Enregistre l'ID du pass Google pour les mises à jour
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { clientId, passId } = body;

    if (!clientId || !passId) {
      return NextResponse.json(
        { error: 'clientId and passId are required' },
        { status: 400 }
      );
    }

    // Mettre à jour le client avec l'ID du pass Google
    const { error } = await supabaseAdmin
      .from('loyalty_clients')
      .update({ google_pass_id: passId })
      .eq('qr_code_data', clientId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[GOOGLE WALLET POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
