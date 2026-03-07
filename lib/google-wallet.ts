import jwt from 'jsonwebtoken';

const GOOGLE_WALLET_API_BASE = 'https://walletobjects.googleapis.com/walletobjects/v1';

/**
 * Decode la clé privée Google depuis les env vars
 */
function getPrivateKey(): string | null {
  let privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY;
  if (!privateKey) return null;

  // Remplacer les \n échappés littéraux
  privateKey = privateKey.replace(/\\n/g, '\n');

  // Si c'est du base64
  if (!privateKey.includes('-----BEGIN')) {
    try {
      const decoded = Buffer.from(privateKey, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN')) {
        privateKey = decoded;
      }
    } catch {
      // pas du base64
    }
  }

  // Reformater si condensé sur une ligne
  if (privateKey.includes('-----BEGIN') && !privateKey.includes('\n-----')) {
    privateKey = privateKey
      .replace(/-----BEGIN (.*?)-----/g, '-----BEGIN $1-----\n')
      .replace(/-----END (.*?)-----/g, '\n-----END $1-----')
      .replace(/(.{64})(?!-)/g, '$1\n');
  }

  return privateKey.includes('-----BEGIN') ? privateKey : null;
}

/**
 * Obtient un access token OAuth2 pour appeler l'API REST Google Wallet
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();

  if (!email || !privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const assertion = jwt.sign(claims, privateKey, { algorithm: 'RS256' });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    console.error('[GOOGLE WALLET AUTH] Token error:', await response.text());
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Crée les IDs pour la classe et l'objet de fidélité
 */
export function getWalletIds(merchantId: string, clientId: string) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '';
  return {
    issuerId,
    classId: `${issuerId}.qualee_loyalty_${merchantId.replace(/-/g, '_')}`,
    objectId: `${issuerId}.qualee_card_${clientId.replace(/-/g, '_')}`,
  };
}

/**
 * Met à jour un LoyaltyObject existant (points, nom, etc.)
 */
export async function updateLoyaltyObject(
  objectId: string,
  updates: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken) {
    return { success: false, error: 'Failed to get access token' };
  }

  // D'abord essayer un PATCH (update)
  const response = await fetch(
    `${GOOGLE_WALLET_API_BASE}/loyaltyObject/${objectId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }
  );

  if (response.ok) {
    return { success: true };
  }

  // Si l'objet n'existe pas (404), c'est normal - le pass n'a pas encore été ajouté
  if (response.status === 404) {
    return { success: false, error: 'Pass not found in Google Wallet (not added yet)' };
  }

  const errorText = await response.text();
  console.error('[GOOGLE WALLET UPDATE] Error:', response.status, errorText);
  return { success: false, error: `API error ${response.status}: ${errorText}` };
}

/**
 * Envoie un message/notification sur un LoyaltyObject
 */
export async function addMessageToLoyaltyObject(
  objectId: string,
  header: string,
  body: string,
  startTime?: string,
  endTime?: string
): Promise<{ success: boolean; error?: string }> {
  const message: any = {
    header,
    body,
    id: `msg_${Date.now()}`,
    messageType: 'TEXT',
  };

  if (startTime) {
    message.displayInterval = {
      start: { date: startTime },
      ...(endTime ? { end: { date: endTime } } : {}),
    };
  }

  return updateLoyaltyObject(objectId, {
    messages: [message],
  });
}

/**
 * Met à jour les points sur un pass Google Wallet
 */
export async function updatePassPoints(
  objectId: string,
  newPoints: number,
  totalPurchases?: number
): Promise<{ success: boolean; error?: string }> {
  const updates: any = {
    loyaltyPoints: {
      label: 'Points',
      balance: {
        int: newPoints,
      },
    },
  };

  if (totalPurchases !== undefined) {
    updates.textModulesData = [
      {
        id: 'purchases',
        header: 'Achats',
        body: `${totalPurchases}`,
      },
    ];
  }

  return updateLoyaltyObject(objectId, updates);
}

/**
 * Vérifie si Google Wallet est configuré
 */
export function isGoogleWalletConfigured(): boolean {
  return !!(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_WALLET_PRIVATE_KEY
  );
}
