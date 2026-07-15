import { NextResponse } from "next/server";
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

export async function GET() {
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
    .from("tags")
    .select("id, name, color")
    .eq("client_id", clientId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao listar tags:", error);
    return NextResponse.json({ error: "Erro ao listar tags" }, { status: 500 });
  }

  return NextResponse.json({ tags: data ?? [] }, { status: 200 });
}
