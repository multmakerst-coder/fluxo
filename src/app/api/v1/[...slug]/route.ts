import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hashApiKey } from "@/lib/api/hash-api-key";
import { sendChannelMessage } from "@/lib/api/send-channel-message";

// ---------------------------------------------------------------------------
// API pública v1 — autenticação por API key (header `Authorization: Bearer <key>`)
// Catch-all: /api/v1/contacts, /api/v1/messages, ...
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(request, context, "GET");
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(request, context, "POST");
}

async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
  method: "GET" | "POST",
) {
  const { slug } = await context.params;
  const resource = slug?.[0];

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const auth = await authenticateApiKey(request, supabase);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  const { clientId } = auth;

  try {
    if (resource === "contacts") {
      if (method === "GET") return await listContacts(supabase, clientId);
      if (method === "POST") return await createContact(request, supabase, clientId);
    }

    if (resource === "messages") {
      if (method === "GET") return await listMessages(supabase, clientId);
      if (method === "POST") return await sendMessage(request, supabase, clientId);
    }

    return NextResponse.json({ error: `Recurso "${resource ?? ""}" não encontrado` }, { status: 404 });
  } catch (error) {
    console.error("Erro na API pública v1:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Autenticação por API key
// ---------------------------------------------------------------------------

async function authenticateApiKey(
  request: NextRequest,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ ok: true; clientId: string } | { ok: false; error: string }> {
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;

  if (!key) {
    return { ok: false, error: "Header Authorization em falta (formato: Bearer <api_key>)" };
  }

  const keyHash = hashApiKey(key);

  const { data: apiKey, error } = await supabase
    .from("api_keys")
    .select("id, client_id, revoked_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error || !apiKey || apiKey.revoked_at) {
    return { ok: false, error: "API key inválida ou revogada" };
  }

  // atualiza last_used_at em best-effort (não bloqueia a resposta em caso de erro)
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", apiKey.id);

  return { ok: true, clientId: apiKey.client_id };
}

// ---------------------------------------------------------------------------
// /api/v1/contacts
// ---------------------------------------------------------------------------

async function listContacts(supabase: Awaited<ReturnType<typeof createClient>>, clientId: string) {
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, email, phone, source_channel, created_at, last_contact_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Erro ao listar contactos" }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

const createContactSchema = z.object({
  name: z.string().min(1),
  email: z.email().optional(),
  phone: z.string().min(1).optional(),
  notes: z.string().optional(),
});

async function createContact(
  request: NextRequest,
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientId: string,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo do pedido inválido" }, { status: 400 });
  }

  const parsed = createContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({ client_id: clientId, ...parsed.data })
    .select("id, name, email, phone, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Erro ao criar contacto" }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// ---------------------------------------------------------------------------
// /api/v1/messages
// ---------------------------------------------------------------------------

async function listMessages(supabase: Awaited<ReturnType<typeof createClient>>, clientId: string) {
  const { data: conversations } = await supabase.from("conversations").select("id").eq("client_id", clientId);
  const conversationIds = (conversations ?? []).map((c) => c.id);

  if (conversationIds.length === 0) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, direction, content, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Erro ao listar mensagens" }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

const sendMessageSchema = z
  .object({
    conversationId: z.uuid().optional(),
    contactId: z.uuid().optional(),
    channel: z.enum(["whatsapp", "instagram", "email"]),
    content: z.string().min(1),
  })
  .refine((data) => data.conversationId || data.contactId, {
    message: "É necessário indicar conversationId ou contactId",
  });

async function sendMessage(
  request: NextRequest,
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientId: string,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo do pedido inválido" }, { status: 400 });
  }

  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const { channel, content, contactId } = parsed.data;
  let conversationId = parsed.data.conversationId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let conversation: any;

  if (conversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("client_id", clientId)
      .single();
    conversation = data;
  } else if (contactId) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", contactId)
      .eq("client_id", clientId)
      .maybeSingle();

    if (!contact) {
      return NextResponse.json({ error: "Contacto não encontrado neste workspace" }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("contact_id", contactId)
      .eq("channel", channel)
      .eq("status", "open")
      .maybeSingle();

    conversation =
      existing ??
      (
        await supabase
          .from("conversations")
          .insert({
            client_id: clientId,
            contact_id: contactId,
            channel,
            status: "open",
            last_message_at: new Date().toISOString(),
          })
          .select("*")
          .single()
      ).data;
  }

  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }
  conversationId = conversation.id;

  const { data: contact } = await supabase.from("contacts").select("*").eq("id", conversation.contact_id).single();

  const { data: message, error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      direction: "outbound",
      sender_type: "bot",
      content,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Erro ao gravar mensagem" }, { status: 500 });
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  let deliveryError: string | undefined;
  try {
    await sendChannelMessage(channel, contact, content);
  } catch (error) {
    deliveryError = error instanceof Error ? error.message : "Erro desconhecido no envio";
    console.error(`Erro ao enviar mensagem via ${channel} (v1 API):`, error);
  }

  return NextResponse.json({ data: message, deliveryError }, { status: 201 });
}
