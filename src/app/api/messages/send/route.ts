import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendChannelMessage } from "@/lib/api/send-channel-message";

const sendSchema = z
  .object({
    conversationId: z.uuid().optional(),
    contactId: z.uuid().optional(),
    channel: z.enum(["whatsapp", "instagram", "email"]),
    content: z.string().min(1, "O conteúdo da mensagem não pode estar vazio"),
  })
  .refine((data) => data.conversationId || data.contactId, {
    message: "É necessário indicar conversationId ou contactId",
  });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo do pedido inválido" }, { status: 400 });
  }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const { channel, content } = parsed.data;
  let { conversationId } = parsed.data;
  const { contactId } = parsed.data;

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  try {
    // resolve a conversa (usa a existente ou cria uma nova a partir do contactId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let conversation: any;

    if (conversationId) {
      const { data } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
      conversation = data;
    } else if (contactId) {
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .eq("contact_id", contactId)
        .eq("channel", channel)
        .eq("status", "open")
        .maybeSingle();

      if (existing) {
        conversation = existing;
      } else {
        const { data: contact } = await supabase.from("contacts").select("client_id").eq("id", contactId).single();
        if (!contact) {
          return NextResponse.json({ error: "Contacto não encontrado" }, { status: 404 });
        }
        const { data: created } = await supabase
          .from("conversations")
          .insert({
            client_id: contact.client_id,
            contact_id: contactId,
            channel,
            status: "open",
            last_message_at: new Date().toISOString(),
          })
          .select("*")
          .single();
        conversation = created;
      }
    }

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
    }
    conversationId = conversation.id;

    const { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", conversation.contact_id)
      .single();

    // identifica o remetente (agente autenticado), se existir sessão
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        direction: "outbound",
        sender_type: user ? "agent" : "bot",
        sender_id: user?.id ?? null,
        content,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Erro ao gravar mensagem:", insertError);
      return NextResponse.json({ error: "Erro ao gravar mensagem" }, { status: 500 });
    }

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    // Envio real através do provedor externo — falha aqui não desfaz o registo interno,
    // mas é reportada na resposta para que a UI possa assinalar o erro de entrega.
    let deliveryError: string | undefined;
    try {
      await sendChannelMessage(channel, contact, content);
    } catch (error) {
      deliveryError = error instanceof Error ? error.message : "Erro desconhecido no envio";
      console.error(`Erro ao enviar mensagem via ${channel}:`, error);
    }

    return NextResponse.json({ message, deliveryError }, { status: 200 });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 });
  }
}
