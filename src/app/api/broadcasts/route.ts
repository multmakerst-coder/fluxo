import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendBroadcast } from "@/lib/broadcast-engine";

const createSchema = z.object({
  channel: z.enum(["whatsapp", "instagram", "email"]),
  name: z.string().min(1, "O nome do broadcast não pode estar vazio"),
  content: z.record(z.string(), z.unknown()),
  scheduledAt: z.string().datetime().nullish(),
});

async function resolveClientId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, owner_id")
    .eq("id", user.id)
    .single();

  return profile?.owner_id ?? profile?.id ?? user.id;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");

  if (!channel || !["whatsapp", "instagram", "email"].includes(channel)) {
    return NextResponse.json({ error: "Parâmetro 'channel' inválido" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const clientId = await resolveClientId(supabase);
  if (!clientId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("client_id", clientId)
    .eq("channel", channel)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao listar broadcasts:", error);
    return NextResponse.json({ error: "Erro ao listar broadcasts" }, { status: 500 });
  }

  return NextResponse.json({ broadcasts: data ?? [] }, { status: 200 });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo do pedido inválido" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const { channel, name, content, scheduledAt } = parsed.data;

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const clientId = await resolveClientId(supabase);
  if (!clientId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: created, error } = await supabase
    .from("broadcasts")
    .insert({
      client_id: clientId,
      channel,
      name,
      content,
      scheduled_at: scheduledAt ?? null,
      status: scheduledAt ? "scheduled" : "sending",
    })
    .select("*")
    .single();

  if (error || !created) {
    console.error("Erro ao criar broadcast:", error);
    return NextResponse.json({ error: "Erro ao criar broadcast" }, { status: 500 });
  }

  // Envio imediato (sem agendamento) — dispara já, mas nunca falha o pedido HTTP por causa
  // de erros de entrega individuais (ficam refletidos em `stats`).
  if (!scheduledAt) {
    try {
      const stats = await sendBroadcast(supabase, created);
      const { data: updated } = await supabase
        .from("broadcasts")
        .update({ status: "sent", stats: { ...stats, sentAt: new Date().toISOString() } })
        .eq("id", created.id)
        .select("*")
        .single();
      return NextResponse.json({ broadcast: updated ?? created }, { status: 201 });
    } catch (error) {
      console.error("Erro ao enviar broadcast imediatamente:", error);
      await supabase.from("broadcasts").update({ status: "failed" }).eq("id", created.id);
      return NextResponse.json({ error: "Broadcast criado mas falhou o envio" }, { status: 502 });
    }
  }

  return NextResponse.json({ broadcast: created }, { status: 201 });
}
