import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    .from("broadcasts")
    .delete()
    .eq("id", id)
    .eq("client_id", clientId)
    .select("id")
    .single();

  if (error || !data) {
    console.error("Erro ao eliminar broadcast:", error);
    return NextResponse.json({ error: "Broadcast não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
