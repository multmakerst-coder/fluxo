// Integrações externas de envio — usadas por /api/messages/send e /api/v1/messages.
// As chamadas são reais (fetch), mas falham sem credenciais válidas em .env.local.

export async function sendWhatsAppMessage(to: string | null | undefined, content: string) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!to) throw new Error("Contacto sem número de telefone");
  if (!token || !phoneNumberId) throw new Error("Credenciais da WhatsApp Cloud API em falta");

  const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: content },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WhatsApp Cloud API respondeu ${response.status}: ${errorBody}`);
  }
}

export async function sendEmailMessage(
  to: string | null | undefined,
  content: string,
  subject: string = "Nova mensagem",
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!to) throw new Error("Contacto sem endereço de email");
  if (!apiKey || !from) throw new Error("Credenciais do Resend em falta");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text: content }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend respondeu ${response.status}: ${errorBody}`);
  }
}

export async function sendInstagramMessage(recipientRef: string | null | undefined, content: string) {
  const token = process.env.META_INSTAGRAM_TOKEN;
  const businessAccountId = process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID;

  // recipientRef é preenchido com "instagram:<external_id>" pelo webhook — ver
  // src/app/api/webhooks/instagram/route.ts
  const recipientId = recipientRef?.startsWith("instagram:") ? recipientRef.replace("instagram:", "") : null;

  if (!recipientId) throw new Error("Contacto sem ID do Instagram associado");
  if (!token || !businessAccountId) throw new Error("Credenciais da Instagram Graph API em falta");

  const response = await fetch(`https://graph.facebook.com/v19.0/${businessAccountId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text: content } }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Instagram Graph API respondeu ${response.status}: ${errorBody}`);
  }
}

export type SendableChannel = "whatsapp" | "instagram" | "email";

/**
 * Despacha o envio para o provedor externo correto consoante o canal.
 * `contact` deve ter os campos phone/email/notes conforme aplicável.
 */
export async function sendChannelMessage(
  channel: SendableChannel,
  contact: { phone?: string | null; email?: string | null; notes?: string | null } | null | undefined,
  content: string,
) {
  if (channel === "whatsapp") {
    await sendWhatsAppMessage(contact?.phone, content);
  } else if (channel === "email") {
    await sendEmailMessage(contact?.email, content);
  } else if (channel === "instagram") {
    await sendInstagramMessage(contact?.notes, content);
  }
}
