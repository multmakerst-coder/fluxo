import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBroadcast, getOrCreateConversation } from "@/lib/broadcast-engine";
import { sendChannelMessage, sendEmailMessage, type SendableChannel } from "@/lib/api/send-channel-message";

// Endpoint de cron — chamado periodicamente (ver vercel.json) para processar:
//  1) Broadcasts agendados (`status = 'scheduled'` e `scheduled_at` já passou)
//  2) Passos de sequências devidos para contactos inscritos (`sequence_enrollments`)
//
// Protegido por CRON_SECRET: aceita tanto o cabeçalho `Authorization: Bearer <secret>`
// (formato usado pelos cron jobs da Vercel) como `?secret=<secret>` para testes manuais.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const providedSecret = authHeader?.replace("Bearer ", "") ?? querySecret;

  if (secret && providedSecret !== secret) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error) {
    console.error("Supabase (service role) indisponível para o cron:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const [broadcastsResult, sequencesResult] = await Promise.allSettled([
    processScheduledBroadcasts(supabase),
    processSequenceSteps(supabase),
  ]);

  return NextResponse.json({
    broadcasts: broadcastsResult.status === "fulfilled" ? broadcastsResult.value : { error: String(broadcastsResult.reason) },
    sequences: sequencesResult.status === "fulfilled" ? sequencesResult.value : { error: String(sequencesResult.reason) },
  });
}

// ---------------------------------------------------------------------------
// Broadcasts agendados
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processScheduledBroadcasts(supabase: any) {
  const { data: due } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString());

  let processed = 0;
  for (const broadcast of due ?? []) {
    await supabase.from("broadcasts").update({ status: "sending" }).eq("id", broadcast.id);
    try {
      const stats = await sendBroadcast(supabase, broadcast);
      await supabase
        .from("broadcasts")
        .update({ status: "sent", stats: { ...stats, sentAt: new Date().toISOString() } })
        .eq("id", broadcast.id);
      processed++;
    } catch (error) {
      console.error(`Erro ao processar broadcast agendado ${broadcast.id}:`, error);
      await supabase.from("broadcasts").update({ status: "failed" }).eq("id", broadcast.id);
    }
  }

  return { processados: processed };
}

// ---------------------------------------------------------------------------
// Sequências — avança inscrições cujo próximo passo já é devido
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processSequenceSteps(supabase: any) {
  const { data: enrollments } = await supabase
    .from("sequence_enrollments")
    .select("*, sequences(id, client_id, channel, status, exit_on_reply)")
    .eq("status", "active");

  let advanced = 0;

  for (const enrollment of enrollments ?? []) {
    const sequence = enrollment.sequences;
    if (!sequence || sequence.status !== "active") continue;

    const { data: steps } = await supabase
      .from("sequence_steps")
      .select("*")
      .eq("sequence_id", sequence.id)
      .order("step_order", { ascending: true });

    const nextStep = (steps ?? [])[enrollment.current_step];
    if (!nextStep) {
      // já não há mais passos — a inscrição termina
      await supabase.from("sequence_enrollments").update({ status: "completed" }).eq("id", enrollment.id);
      continue;
    }

    const dueAt = new Date(enrollment.enrolled_at).getTime() + (nextStep.delay_minutes ?? 0) * 60_000;
    if (Date.now() < dueAt) continue;

    const { data: contact } = await supabase.from("contacts").select("*").eq("id", enrollment.contact_id).single();
    if (!contact) continue;

    if (sequence.exit_on_reply) {
      const { data: lastInbound } = await supabase
        .from("messages")
        .select("id, created_at, conversations!inner(contact_id, channel)")
        .eq("conversations.contact_id", contact.id)
        .eq("conversations.channel", sequence.channel)
        .eq("direction", "inbound")
        .gt("created_at", enrollment.enrolled_at)
        .limit(1)
        .maybeSingle();

      if (lastInbound) {
        await supabase.from("sequence_enrollments").update({ status: "exited" }).eq("id", enrollment.id);
        continue;
      }
    }

    const content = nextStep.content ?? {};
    const text = String(content.mensagem ?? content.corpo ?? "");
    if (!text) continue;

    const channel = sequence.channel as SendableChannel;
    const conversationId = await getOrCreateConversation(supabase, sequence.client_id, channel, contact.id);
    if (conversationId) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        direction: "outbound",
        sender_type: "bot",
        content: text,
      });
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
    }

    try {
      if (channel === "email") {
        await sendEmailMessage(contact.email, text, String(content.assunto ?? sequence.name ?? "Nova mensagem"));
      } else {
        await sendChannelMessage(channel, contact, text);
      }
    } catch (error) {
      console.error(`Erro ao enviar passo de sequência ${nextStep.id} para contacto ${contact.id}:`, error);
    }

    // Não existe uma coluna separada para "data do último passo enviado", por isso
    // reutilizamos `enrolled_at` como referência para o cálculo do próximo `delay_minutes`.
    const isLastStep = enrollment.current_step + 1 >= (steps ?? []).length;
    await supabase
      .from("sequence_enrollments")
      .update({
        current_step: enrollment.current_step + 1,
        status: isLastStep ? "completed" : "active",
        enrolled_at: new Date().toISOString(),
      })
      .eq("id", enrollment.id);

    advanced++;
  }

  return { avancadas: advanced };
}
