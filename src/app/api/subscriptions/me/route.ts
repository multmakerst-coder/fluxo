import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("id, owner_id").eq("id", user.id).single();
  const clientId = profile?.owner_id ?? profile?.id ?? user.id;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ subscription: subscription ?? null }, { status: 200 });
}
