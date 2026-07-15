import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBroadcast } from "@/lib/broadcast-engine";

// Envio manual ("Enviar agora") de um broadcast em rascunho/agendado, e também o
// endpoint que um futuro cron de agendamento poderia invocar quando `scheduled_at` expira.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const { data: broadcast, error: fetchError } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !broadcast) {
    return NextResponse.json({ error: "Broadcast não encontrado" }, { status: 404 });
  }

  if (broadcast.status === "sending" || broadcast.status === "sent") {
    return NextResponse.json({ error: "Este broadcast já foi enviado" }, { status: 400 });
  }

  await supabase.from("broadcasts").update({ status: "sending" }).eq("id", id);

  try {
    const stats = await sendBroadcast(supabase, broadcast);
    const { data: updated, error: updateError } = await supabase
      .from("broadcasts")
      .update({ status: "sent", stats: { ...stats, sentAt: new Date().toISOString() } })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: "Erro ao atualizar broadcast após envio" }, { status: 500 });
    }

    return NextResponse.json({ broadcast: updated }, { status: 200 });
  } catch (error) {
    console.error("Erro ao enviar broadcast:", error);
    await supabase.from("broadcasts").update({ status: "failed" }).eq("id", id);
    return NextResponse.json({ error: "Erro ao enviar broadcast" }, { status: 502 });
  }
}
