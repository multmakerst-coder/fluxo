import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, owner_id, role")
      .eq("id", user.id)
      .single();

    const workspaceId = profile?.owner_id ?? profile?.id;
    const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

    // As policies de RLS já limitam o acesso aos dados do workspace correto; esta
    // verificação explícita apenas devolve uma mensagem de erro clara em vez de dados vazios.
    if (!isAdmin && workspaceId !== clientId) {
      return NextResponse.json({ error: "Acesso negado a este cliente" }, { status: 403 });
    }

    const [{ data: conversations }, { count: contactsCount }] = await Promise.all([
      supabase.from("conversations").select("id, channel, status").eq("client_id", clientId),
      supabase.from("contacts").select("id", { count: "exact", head: true }).eq("client_id", clientId),
    ]);

    const conversationIds = (conversations ?? []).map((c) => c.id);

    const { data: messages } = conversationIds.length
      ? await supabase
          .from("messages")
          .select("id, direction, conversation_id, created_at")
          .in("conversation_id", conversationIds)
      : { data: [] };

    const messagesByChannel: Record<string, number> = {};
    for (const conversation of conversations ?? []) {
      const count = (messages ?? []).filter((m) => m.conversation_id === conversation.id).length;
      messagesByChannel[conversation.channel] = (messagesByChannel[conversation.channel] ?? 0) + count;
    }

    const inboundMessages = (messages ?? []).filter((m) => m.direction === "inbound").length;
    const outboundMessages = (messages ?? []).filter((m) => m.direction === "outbound").length;

    // taxa de resposta = percentagem de conversas com pelo menos uma mensagem outbound
    const conversationsWithReply = new Set(
      (messages ?? []).filter((m) => m.direction === "outbound").map((m) => m.conversation_id),
    );
    const totalConversations = conversations?.length ?? 0;
    const responseRate = totalConversations > 0 ? conversationsWithReply.size / totalConversations : 0;

    return NextResponse.json(
      {
        clientId,
        totals: {
          contacts: contactsCount ?? 0,
          conversations: totalConversations,
          messages: (messages ?? []).length,
          inboundMessages,
          outboundMessages,
        },
        messagesByChannel,
        responseRate: Number(responseRate.toFixed(4)),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao calcular analytics:", error);
    return NextResponse.json({ error: "Erro ao calcular analytics" }, { status: 500 });
  }
}
