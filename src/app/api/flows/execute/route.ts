import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { runFlowForContact, type FlowEdge, type FlowNode } from "@/lib/flow-engine";

const executeSchema = z.object({
  flowId: z.uuid(),
  contactId: z.uuid(),
  trigger: z.record(z.string(), z.unknown()).optional().default({}),
  /** Quando true, grava as mensagens no Inbox mas não chama as APIs externas (usado pelo botão "Testar"). */
  simulate: z.boolean().optional().default(false),
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

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo do pedido inválido" }, { status: 400 });
  }

  const parsed = executeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const { flowId, contactId, simulate } = parsed.data;

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

  try {
    const { data: flow, error: flowError } = await supabase
      .from("flows")
      .select("*")
      .eq("id", flowId)
      .eq("client_id", clientId)
      .single();

    if (flowError || !flow) {
      return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 });
    }

    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .eq("client_id", clientId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: "Contacto não encontrado" }, { status: 404 });
    }

    const nodes = (flow.nodes ?? []) as FlowNode[];
    const edges = (flow.edges ?? []) as FlowEdge[];

    const steps = await runFlowForContact({
      supabase,
      flow,
      contact,
      nodes,
      edges,
      deliver: !simulate,
    });

    await supabase
      .from("flows")
      .update({ activations_count: (flow.activations_count ?? 0) + 1 })
      .eq("id", flowId);

    return NextResponse.json({ flowId, contactId, steps }, { status: 200 });
  } catch (error) {
    console.error("Erro ao executar fluxo:", error);
    return NextResponse.json({ error: "Erro ao executar fluxo" }, { status: 500 });
  }
}
