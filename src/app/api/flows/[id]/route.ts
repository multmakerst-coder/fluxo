import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["active", "inactive", "draft"]).optional(),
  triggerType: z.string().min(1).optional(),
  triggerConfig: z.record(z.string(), z.unknown()).optional(),
  nodes: z.array(z.record(z.string(), z.unknown())).optional(),
  edges: z.array(z.record(z.string(), z.unknown())).optional(),
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
    .eq("id", id)
    .eq("client_id", clientId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ flow: data }, { status: 200 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo do pedido inválido" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.status !== undefined) update.status = parsed.data.status;
  if (parsed.data.triggerType !== undefined) update.trigger_type = parsed.data.triggerType;
  if (parsed.data.triggerConfig !== undefined) update.trigger_config = parsed.data.triggerConfig;
  if (parsed.data.nodes !== undefined) update.nodes = parsed.data.nodes;
  if (parsed.data.edges !== undefined) update.edges = parsed.data.edges;
  update.updated_at = new Date().toISOString();

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
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
    .update(update)
    .eq("id", id)
    .eq("client_id", clientId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Erro ao atualizar fluxo:", error);
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ flow: data }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
    .delete()
    .eq("id", id)
    .eq("client_id", clientId)
    .select("id")
    .single();

  if (error || !data) {
    console.error("Erro ao eliminar fluxo:", error);
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
