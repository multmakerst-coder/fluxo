// Motor de envio de broadcasts — resolve a audiência real de um broadcast (contactos
// reais na tabela `contacts`, opcionalmente filtrados por uma tag real) e envia a
// mensagem a cada contacto através do dispatcher de canais já usado no resto da app.
//
// É usado por:
//  1) POST /api/broadcasts — quando o broadcast é criado para envio imediato
//  2) POST /api/broadcasts/[id]/send — envio manual ("Enviar agora") de um rascunho/agendado
//  3) (futuramente) um cron que processa broadcasts agendados cujo scheduled_at já passou

import type { createClient } from "@/lib/supabase/server";
import { sendChannelMessage, sendEmailMessage } from "@/lib/api/send-channel-message";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = Awaited<ReturnType<typeof createClient>> | any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export interface BroadcastStats {
  destinatarios: number;
  entregues: number;
  falhas: number;
}

// ---------------------------------------------------------------------------
// Audiência
// ---------------------------------------------------------------------------
export async function resolveAudience(
  supabase: SupabaseClient,
  clientId: string,
  channel: "whatsapp" | "instagram" | "email",
  tagId?: string | null,
): Promise<Row[]> {
  let contactIds: string[] | null = null;

  if (tagId) {
    const { data: links } = await supabase.from("contact_tags").select("contact_id").eq("tag_id", tagId);
    const ids: string[] = (links ?? []).map((l: Row) => l.contact_id);
    if (ids.length === 0) return [];
    contactIds = ids;
  }

  let query = supabase.from("contacts").select("*").eq("client_id", clientId);
  if (contactIds) query = query.in("id", contactIds);

  const { data } = await query;
  const contacts: Row[] = data ?? [];

  if (channel === "whatsapp") return contacts.filter((c) => !!c.phone);
  if (channel === "email") return contacts.filter((c) => !!c.email);
  return contacts.filter((c) => c.source_channel === "instagram" || String(c.notes ?? "").startsWith("instagram:"));
}

// ---------------------------------------------------------------------------
// Conversa (mesma lógica usada no flow-engine, duplicada aqui para não acoplar módulos)
// ---------------------------------------------------------------------------
export async function getOrCreateConversation(
  supabase: SupabaseClient,
  clientId: string,
  channel: string,
  contactId: string,
): Promise<string | undefined> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("contact_id", contactId)
    .eq("channel", channel)
    .eq("status", "open")
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created } = await supabase
    .from("conversations")
    .insert({
      client_id: clientId,
      contact_id: contactId,
      channel,
      status: "open",
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  return created?.id;
}

// ---------------------------------------------------------------------------
// Envio
// ---------------------------------------------------------------------------
export async function sendBroadcast(supabase: SupabaseClient, broadcast: Row): Promise<BroadcastStats> {
  const content = broadcast.content ?? {};
  const tagId = content.audienceTagId ?? null;
  const contacts = await resolveAudience(supabase, broadcast.client_id, broadcast.channel, tagId);

  let entregues = 0;
  let falhas = 0;

  for (const contact of contacts) {
    const text =
      broadcast.channel === "email"
        ? String(content.corpo ?? "")
        : String(content.corpo ?? "").replaceAll("{{1}}", contact.name ?? "");

    if (!text) {
      falhas++;
      continue;
    }

    const conversationId = await getOrCreateConversation(supabase, broadcast.client_id, broadcast.channel, contact.id);
    if (conversationId) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        direction: "outbound",
        sender_type: "bot",
        content: text,
      });
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
    }

    try {
      if (broadcast.channel === "email") {
        await sendEmailMessage(contact.email, text, String(content.assunto ?? broadcast.name));
      } else {
        await sendChannelMessage(broadcast.channel, contact, text);
      }
      entregues++;
    } catch (error) {
      console.error(`Falha ao enviar broadcast "${broadcast.name}" para contacto ${contact.id}:`, error);
      falhas++;
    }
  }

  return { destinatarios: contacts.length, entregues, falhas };
}
