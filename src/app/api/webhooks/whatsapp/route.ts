import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyMetaSignature } from "@/lib/api/verify-signature";
import { findActiveFlowForTrigger, runFlowForContact } from "@/lib/flow-engine";

// ---------------------------------------------------------------------------
// Tipos mínimos do payload da WhatsApp Cloud API (Meta)
// ---------------------------------------------------------------------------
interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

interface WhatsAppContact {
  profile: { name: string };
  wa_id: string;
}

interface WhatsAppValue {
  messaging_product: string;
  metadata?: { display_phone_number?: string; phone_number_id?: string };
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
}

interface WhatsAppChange {
  field: string;
  value: WhatsAppValue;
}

interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

// ---------------------------------------------------------------------------
// GET — verificação do webhook (handshake inicial da Meta)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// ---------------------------------------------------------------------------
// POST — receção de eventos (mensagens, estados, etc.)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const appSecret = process.env.META_APP_SECRET;

  // só valida a assinatura se houver secret configurado (evita rebentar em dev sem .env)
  if (appSecret && !verifyMetaSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload JSON inválido" }, { status: 400 });
  }

  // A Meta espera uma resposta 200 rápida — o processamento não deve bloquear a resposta
  // por muito tempo nem fazer a rota falhar por erros de infraestrutura (Supabase, etc.)
  try {
    await processWhatsAppPayload(payload);
  } catch (error) {
    console.error("Erro ao processar webhook do WhatsApp:", error);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function processWhatsAppPayload(payload: WhatsAppWebhookPayload) {
  if (payload.object !== "whatsapp_business_account") return;

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível ao processar webhook do WhatsApp:", error);
    return;
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages?.length) continue;

      for (const message of value.messages) {
        try {
          await handleInboundMessage(supabase, value, message);
        } catch (error) {
          console.error("Erro ao gravar mensagem do WhatsApp:", error);
        }
      }
    }
  }
}

async function handleInboundMessage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  value: WhatsAppValue,
  message: WhatsAppMessage,
) {
  const waId = message.from;
  const profileName = value.contacts?.find((c) => c.wa_id === waId)?.profile.name;
  const content = message.text?.body ?? `[mensagem do tipo ${message.type}]`;

  // encontra o contacto existente pelo número de telefone
  const { data: existingContact } = await supabase
    .from("contacts")
    .select("id, client_id")
    .eq("phone", waId)
    .maybeSingle();

  let contactId: string | undefined = existingContact?.id;
  let clientId: string | undefined = existingContact?.client_id;
  let isNewContact = false;

  if (!contactId) {
    // resolve o workspace (client_id) a partir do canal ligado com este phone_number_id
    const { data: channel } = await supabase
      .from("channels")
      .select("client_id")
      .eq("type", "whatsapp")
      .eq("external_account_id", value.metadata?.phone_number_id ?? "")
      .maybeSingle();

    clientId = channel?.client_id;
    if (!clientId) return; // sem workspace conhecido não é possível associar o contacto

    const { data: newContact } = await supabase
      .from("contacts")
      .insert({
        client_id: clientId,
        name: profileName ?? waId,
        phone: waId,
        source_channel: "whatsapp",
        last_contact_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    contactId = newContact?.id;
    isNewContact = true;
  }

  if (!contactId || !clientId) return;

  // encontra ou cria a conversa aberta para este contacto neste canal
  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("contact_id", contactId)
    .eq("channel", "whatsapp")
    .eq("status", "open")
    .maybeSingle();

  let conversationId: string | undefined = existingConversation?.id;

  if (!conversationId) {
    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({
        client_id: clientId,
        contact_id: contactId,
        channel: "whatsapp",
        status: "open",
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    conversationId = newConversation?.id;
  }

  if (!conversationId) return;

  // Idempotência: o schema.sql não tem uma coluna `external_id` na tabela `messages`
  // para guardar o `message.id` da WhatsApp Cloud API. Em produção o ideal é adicionar
  // `external_id text unique` a `messages` e usar `message.id` diretamente. Aqui fazemos
  // uma verificação best-effort (mesma conversa + conteúdo + janela recente) para evitar
  // duplicados em caso de reenvio do mesmo evento pela Meta.
  const { data: duplicate } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("direction", "inbound")
    .eq("content", content)
    .gte("created_at", new Date(Date.now() - 60_000).toISOString())
    .maybeSingle();

  if (duplicate) return;

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "inbound",
    sender_type: "contact",
    content,
  });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  // Motor de automação: procura um fluxo ativo cujo gatilho corresponda a este evento
  // e, se encontrar, executa-o e envia a resposta automaticamente.
  try {
    const triggerTypes = isNewContact ? ["primeira-mensagem", "palavra-chave"] : ["palavra-chave"];
    const flow = await findActiveFlowForTrigger({
      supabase,
      clientId,
      channel: "whatsapp",
      triggerTypes,
      messageText: content,
    });

    if (flow) {
      const { data: contactRow } = await supabase.from("contacts").select("*").eq("id", contactId).single();
      if (contactRow) {
        await runFlowForContact({
          supabase,
          flow,
          contact: contactRow,
          nodes: Array.isArray(flow.nodes) ? flow.nodes : [],
          edges: Array.isArray(flow.edges) ? flow.edges : [],
          deliver: true,
        });
        await supabase
          .from("flows")
          .update({ activations_count: (flow.activations_count ?? 0) + 1 })
          .eq("id", flow.id);
      }
    }
  } catch (error) {
    console.error("Erro ao executar fluxo automático (WhatsApp):", error);
  }
}
