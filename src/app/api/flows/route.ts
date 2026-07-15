import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getBlockDef, getTriggerDef, type Channel } from "@/lib/flow-blocks";

const createSchema = z.object({
  channel: z.enum(["whatsapp", "instagram", "email"]),
  name: z.string().min(1, "O nome do fluxo não pode estar vazio"),
  triggerId: z.string().min(1),
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
    .from("flows")
    .select("*")
    .eq("client_id", clientId)
    .eq("channel", channel)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao listar fluxos:", error);
    return NextResponse.json({ error: "Erro ao listar fluxos" }, { status: 500 });
  }

  return NextResponse.json({ flows: data ?? [] }, { status: 200 });
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

  const { channel, name, triggerId } = parsed.data;

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

  const triggerDef = getTriggerDef(channel as Channel, triggerId);
  if (!triggerDef) {
    return NextResponse.json({ error: "Gatilho inválido para este canal" }, { status: 400 });
  }
  const messageBlock = getBlockDef("texto")!;

  const nodes = [
    {
      id: "trigger-1",
      type: "trigger",
      position: { x: 40, y: 80 },
      data: { kind: "trigger", blockId: triggerDef.id, label: triggerDef.label, channel, config: {} },
    },
    {
      id: "node-1",
      type: "mensagem",
      position: { x: 40, y: 280 },
      data: {
        kind: "mensagem",
        blockId: messageBlock.id,
        label: messageBlock.label,
        channel,
        config: { texto: "Olá {{nome}}! Obrigado por entrares em contacto. 👋" },
      },
    },
  ];
  const edges = [
    {
      id: "edge-1",
      source: "trigger-1",
      target: "node-1",
      type: "smoothstep",
      style: { stroke: "var(--color-primary)", strokeWidth: 2 },
    },
  ];

  const { data, error } = await supabase
    .from("flows")
    .insert({
      client_id: clientId,
      channel,
      name,
      status: "draft",
      trigger_type: triggerId,
      trigger_config: {},
      nodes,
      edges,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao criar fluxo:", error);
    return NextResponse.json({ error: "Erro ao criar fluxo" }, { status: 500 });
  }

  return NextResponse.json({ flow: data }, { status: 201 });
}
