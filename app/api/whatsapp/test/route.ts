import { NextRequest, NextResponse } from 'next/server';

// Whapi API endpoint to check connection status
const WHAPI_CHECK_URL = 'https://gate.whapi.cloud/health';
const WHAPI_ACCOUNT_URL = 'https://gate.whapi.cloud/settings';

export async function GET(request: NextRequest) {
  try {
    // 1. Check if WHAPI_API_KEY is configured
    const whapiKey = process.env.WHAPI_API_KEY;

    if (!whapiKey) {
      return NextResponse.json({
        success: false,
        status: 'not_configured',
        message: 'WHAPI_API_KEY n\'est pas configuré dans les variables d\'environnement',
        details: {
          configured: false,
          keyPresent: false,
        }
      }, { status: 500 });
    }

    // 2. Test the API key by fetching account settings
    const response = await fetch(WHAPI_ACCOUNT_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${whapiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }

      return NextResponse.json({
        success: false,
        status: 'api_error',
        message: 'Erreur lors de la connexion à l\'API WHAPI',
        details: {
          configured: true,
          keyPresent: true,
          httpStatus: response.status,
          error: errorDetails,
        }
      }, { status: response.status === 401 ? 401 : 500 });
    }

    const accountData = await response.json();

    // 3. Return success with account info
    return NextResponse.json({
      success: true,
      status: 'connected',
      message: 'Connexion WHAPI réussie!',
      details: {
        configured: true,
        keyPresent: true,
        connected: true,
        account: {
          phone: accountData.phone || accountData.settings?.phone || 'Non disponible',
          name: accountData.pushname || accountData.settings?.pushname || 'Non disponible',
          status: accountData.status || 'active',
        }
      }
    });

  } catch (error: any) {
    console.error('WHAPI test error:', error);
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Erreur lors du test de connexion WHAPI',
      details: {
        configured: true,
        keyPresent: !!process.env.WHAPI_API_KEY,
        error: error.message,
      }
    }, { status: 500 });
  }
}

// POST - Send a test message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        message: 'phoneNumber est requis pour envoyer un message test',
      }, { status: 400 });
    }

    const whapiKey = process.env.WHAPI_API_KEY;

    if (!whapiKey) {
      return NextResponse.json({
        success: false,
        message: 'WHAPI_API_KEY non configuré',
      }, { status: 500 });
    }

    // Format phone number (remove + prefix)
    const formattedPhone = phoneNumber.replace(/^\+/, '');

    // Send test message
    const response = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whapiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        body: `🎉 Test Qualee WhatsApp\n\nCe message confirme que votre intégration WhatsApp fonctionne correctement!\n\n✅ Configuration validée\n📱 Numéro: ${phoneNumber}\n⏰ ${new Date().toLocaleString('fr-FR')}\n\n🎰 Qualee - Customer Feedback & Loyalty`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WHAPI send test error:', response.status, errorText);

      return NextResponse.json({
        success: false,
        message: 'Échec de l\'envoi du message test',
        error: errorText,
        httpStatus: response.status,
      }, { status: 500 });
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Message test envoyé avec succès!',
      messageId: result.sent?.id || result.message_id,
      to: phoneNumber,
    });

  } catch (error: any) {
    console.error('WHAPI test send error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de l\'envoi du message test',
      error: error.message,
    }, { status: 500 });
  }
}
