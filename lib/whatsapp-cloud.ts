/**
 * WhatsApp Business Cloud API Helper
 * Utilise l'API officielle Meta pour envoyer des messages template
 */

const META_API_BASE = 'https://graph.facebook.com/v21.0';

export interface WhatsAppConfig {
  phone_number_id: string;
  waba_id: string;
  access_token: string;
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: { header_text?: string[]; body_text?: string[][]; header_handle?: string[] };
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
  text: string;
  url?: string;
  phone_number?: string;
  example?: string[];
}

export interface MetaTemplate {
  name: string;
  language: string;
  status: string;
  category: string;
  id: string;
  components: TemplateComponent[];
}

// ============ TEMPLATES ============

/**
 * Liste les templates depuis Meta
 */
export async function listTemplates(
  config: WhatsAppConfig
): Promise<{ templates: MetaTemplate[]; error?: string }> {
  try {
    const res = await fetch(
      `${META_API_BASE}/${config.waba_id}/message_templates?limit=100`,
      {
        headers: { Authorization: `Bearer ${config.access_token}` },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return { templates: [], error: err.error?.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { templates: data.data || [] };
  } catch (error) {
    return { templates: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Cree un template sur Meta
 */
export async function createTemplate(
  config: WhatsAppConfig,
  template: {
    name: string;
    language: string;
    category: string;
    components: TemplateComponent[];
  }
): Promise<{ success: boolean; templateId?: string; error?: string }> {
  try {
    const res = await fetch(
      `${META_API_BASE}/${config.waba_id}/message_templates`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error?.message || `HTTP ${res.status}` };
    }

    return { success: true, templateId: data.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Supprime un template sur Meta
 */
export async function deleteTemplate(
  config: WhatsAppConfig,
  templateName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${META_API_BASE}/${config.waba_id}/message_templates?name=${templateName}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${config.access_token}` },
      }
    );

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error?.message || `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============ MESSAGES ============

/**
 * Envoie un message template a un destinataire
 */
export async function sendTemplateMessage(
  config: WhatsAppConfig,
  to: string,
  templateName: string,
  languageCode: string,
  components?: any[]
): Promise<{ success: boolean; wamid?: string; error?: string }> {
  try {
    // Formatter le numero (enlever le +)
    const phone = to.replace(/^\+/, '').replace(/\s/g, '');

    const payload: any = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    if (components && components.length > 0) {
      payload.template.components = components;
    }

    const res = await fetch(
      `${META_API_BASE}/${config.phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error?.message || `HTTP ${res.status}`,
      };
    }

    const wamid = data.messages?.[0]?.id;
    return { success: true, wamid };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Teste la connexion en listant 1 template
 */
export async function testConnection(
  config: WhatsAppConfig
): Promise<{ success: boolean; businessName?: string; error?: string }> {
  try {
    // Test 1: Verifier l'acces au WABA
    const res = await fetch(
      `${META_API_BASE}/${config.waba_id}?fields=name,id`,
      {
        headers: { Authorization: `Bearer ${config.access_token}` },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.error?.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { success: true, businessName: data.name };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============ WEBHOOK ============

/**
 * Verifie la signature HMAC-SHA256 du webhook Meta
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string,
  appSecret: string
): Promise<boolean> {
  try {
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(body)
      .digest('hex');
    return `sha256=${expectedSignature}` === signature;
  } catch {
    return false;
  }
}

/**
 * Parse les statuts depuis un webhook Meta
 */
export interface WebhookStatus {
  wamid: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  errorCode?: string;
  errorMessage?: string;
}

export function parseWebhookStatuses(payload: any): WebhookStatus[] {
  const statuses: WebhookStatus[] = [];

  try {
    const entries = payload.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const statusUpdates = value.statuses || [];
        for (const s of statusUpdates) {
          statuses.push({
            wamid: s.id,
            status: s.status,
            timestamp: s.timestamp,
            errorCode: s.errors?.[0]?.code?.toString(),
            errorMessage: s.errors?.[0]?.title,
          });
        }
      }
    }
  } catch {
    // Silently handle malformed payloads
  }

  return statuses;
}

// ============ MEDIA ============

/**
 * Upload un media pour l'utiliser dans un template header
 */
export async function uploadMedia(
  config: WhatsAppConfig,
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<{ mediaId?: string; error?: string }> {
  try {
    const formData = new FormData();
    const uint8 = new Uint8Array(fileBuffer);
    formData.append('file', new Blob([uint8], { type: mimeType }), fileName);
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', mimeType);

    const res = await fetch(
      `${META_API_BASE}/${config.phone_number_id}/media`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.access_token}` },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error?.message || `HTTP ${res.status}` };
    }

    return { mediaId: data.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
