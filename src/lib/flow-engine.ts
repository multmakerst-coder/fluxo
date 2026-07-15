// Motor de execução de fluxos — interpreta a estrutura nodes/edges tal como é
// produzida pelo editor visual (src/components/flow-editor) e persistida na
// tabela `flows` (colunas jsonb `nodes`/`edges`). É usado:
//  1) pelo endpoint manual /api/flows/execute (testes/chamadas externas via API pública)
//  2) pelos webhooks (WhatsApp/Instagram) para responder automaticamente a um gatilho
//
// Importante: os `kind`/`blockId` aqui têm de corresponder exatamente aos valores
// definidos em src/lib/flow-blocks.ts — ver esse ficheiro para a lista de blocos,
// campos de configuração e triggers suportados por canal.

import type { createClient } from "@/lib/supabase/server";
import { sendChannelMessage, sendEmailMessage } from "@/lib/api/send-channel-message";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = Awaited<ReturnType<typeof createClient>> | any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export interface FlowNode {
  id: string;
  type?: string;
  data?: {
    kind?: string;
    blockId?: string;
    label?: string;
    channel?: string;
    config?: Record<string, unknown>;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
}

export interface ExecutionStep {
  nodeId: string;
  kind: string;
  blockId: string;
  result: string;
  details?: unknown;
}

const MAX_STEPS = 50;

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// ---------------------------------------------------------------------------
// Execução principal
// ---------------------------------------------------------------------------
export async function runFlowForContact(params: {
  supabase: SupabaseClient;
  flow: Row;
  contact: Row;
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** Quando false, grava as mensagens no Inbox mas não chama as APIs externas (útil para testes). */
  deliver?: boolean;
}): Promise<ExecutionStep[]> {
  const { supabase, flow, contact, nodes, edges, deliver = true } = params;
  const steps: ExecutionStep[] = [];

  const startNode =
    nodes.find((n) => n.data?.kind === "trigger") ??
    nodes.find((n) => !edges.some((e) => e.target === n.id));

  if (!startNode) {
    steps.push({ nodeId: "n/a", kind: "none", blockId: "", result: "Fluxo sem nós de início" });
    return steps;
  }

  let conversationId: string | undefined;
  const visited = new Set<string>();
  let currentNode: FlowNode | undefined = startNode;

  while (currentNode && steps.length < MAX_STEPS) {
    if (visited.has(currentNode.id)) {
      steps.push({
        nodeId: currentNode.id,
        kind: currentNode.data?.kind ?? "unknown",
        blockId: currentNode.data?.blockId ?? "",
        result: "Ciclo detetado — execução interrompida",
      });
      break;
    }
    visited.add(currentNode.id);

    const data = currentNode.data ?? {};
    const kind = data.kind ?? "unknown";
    const blockId = data.blockId ?? "";
    const config = data.config ?? {};
    let branch: "a" | "b" | undefined;

    switch (kind) {
      case "trigger": {
        steps.push({ nodeId: currentNode.id, kind, blockId, result: "Fluxo despoletado" });
        break;
      }

      case "mensagem":
      case "interacao": {
        if (blockId === "aguardar") {
          const duracao = config.duracao ?? 1;
          const unidade = str(config.unidade) || "horas";
          steps.push({
            nodeId: currentNode.id,
            kind,
            blockId,
            result: `Passo de espera (${duracao} ${unidade}) ignorado — a execução é síncrona e não suporta atrasos`,
          });
          break;
        }
        if (blockId === "pergunta") {
          // A resposta do contacto seria capturada numa próxima mensagem inbound;
          // este motor síncrono não mantém estado de "à espera de resposta" entre
          // pedidos, por isso limita-se a enviar a pergunta.
        }

        const content = buildOutboundContent(blockId, config);
        if (!content) {
          steps.push({ nodeId: currentNode.id, kind, blockId, result: "Sem conteúdo configurado — ignorado" });
          break;
        }

        conversationId = conversationId ?? (await getOrCreateConversation(supabase, flow, contact.id));
        if (!conversationId) {
          steps.push({ nodeId: currentNode.id, kind, blockId, result: "Sem conversa disponível — ignorado" });
          break;
        }

        await supabase.from("messages").insert({
          conversation_id: conversationId,
          direction: "outbound",
          sender_type: "bot",
          content,
        });
        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", conversationId);

        let deliveryError: string | undefined;
        if (deliver) {
          try {
            await sendChannelMessage(flow.channel, contact, content);
          } catch (error) {
            deliveryError = error instanceof Error ? error.message : "Erro desconhecido no envio";
          }
        }

        steps.push({
          nodeId: currentNode.id,
          kind,
          blockId,
          result: deliveryError ? `Mensagem gravada; falha no envio real: ${deliveryError}` : "Mensagem enviada",
          details: { content, deliveryError },
        });
        break;
      }

      case "ia": {
        if (blockId === "resposta-ia") {
          const instrucoes = str(config.instrucoes);
          if (!instrucoes) {
            steps.push({ nodeId: currentNode.id, kind, blockId, result: "Sem instruções configuradas — ignorado" });
            break;
          }
          // Nota: este projeto não tem uma chave de modelo de IA configurada
          // (ex: OPENAI_API_KEY) em .env.local.example, pelo que este bloco envia
          // as instruções tal como estão em vez de gerar uma resposta com um LLM.
          conversationId = conversationId ?? (await getOrCreateConversation(supabase, flow, contact.id));
          if (!conversationId) {
            steps.push({ nodeId: currentNode.id, kind, blockId, result: "Sem conversa disponível — ignorado" });
            break;
          }
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            direction: "outbound",
            sender_type: "bot",
            content: instrucoes,
          });
          await supabase
            .from("conversations")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", conversationId);

          let deliveryError: string | undefined;
          if (deliver) {
            try {
              await sendChannelMessage(flow.channel, contact, instrucoes);
            } catch (error) {
              deliveryError = error instanceof Error ? error.message : "Erro desconhecido no envio";
            }
          }
          steps.push({
            nodeId: currentNode.id,
            kind,
            blockId,
            result: deliveryError
              ? `Resposta enviada sem modelo de IA (falha no envio real: ${deliveryError})`
              : "Resposta enviada sem modelo de IA configurado",
          });
        } else {
          steps.push({
            nodeId: currentNode.id,
            kind,
            blockId,
            result: "Reconhecimento de intenção requer um modelo de IA configurado — ignorado",
          });
        }
        break;
      }

      case "logica": {
        const passed = await evaluateLogicNode(supabase, flow, contact, blockId, config);
        branch = passed ? "a" : "b";
        steps.push({
          nodeId: currentNode.id,
          kind,
          blockId,
          result: `Condição avaliada como ${passed ? "verdadeira" : "falsa"}`,
          details: { branch },
        });
        break;
      }

      case "acao": {
        const result = await runAction(supabase, flow, contact, blockId, config);
        steps.push({ nodeId: currentNode.id, kind, blockId, result });
        break;
      }

      default: {
        steps.push({ nodeId: currentNode.id, kind, blockId, result: "Tipo de nó não reconhecido — ignorado" });
        break;
      }
    }

    const outgoing = edges.filter((e) => e.source === currentNode!.id);
    const nextEdge = branch
      ? outgoing.find((e) => e.sourceHandle === branch) ?? outgoing.find((e) => !e.sourceHandle)
      : outgoing[0];

    currentNode = nextEdge ? nodes.find((n) => n.id === nextEdge.target) : undefined;
  }

  return steps;
}

// ---------------------------------------------------------------------------
// Conteúdo das mensagens de saída, por blockId
// ---------------------------------------------------------------------------
function buildOutboundContent(blockId: string, config: Record<string, unknown>): string | null {
  switch (blockId) {
    case "texto":
      return str(config.texto) || null;
    case "imagem":
    case "video":
    case "audio":
    case "documento": {
      const url = str(config.url);
      const legenda = str(config.legenda);
      const parts = [legenda, url].filter(Boolean);
      return parts.length ? parts.join("\n") : null;
    }
    case "localizacao": {
      const morada = str(config.morada);
      return morada ? `📍 ${morada}` : null;
    }
    case "botoes": {
      const texto = str(config.texto);
      const botoes = Array.isArray(config.botoes) ? (config.botoes as unknown[]).map(String) : [];
      const lines = botoes.map((b) => `• ${b}`).join("\n");
      const parts = [texto, lines].filter(Boolean);
      return parts.length ? parts.join("\n") : null;
    }
    case "lista": {
      const titulo = str(config.titulo);
      const opcoes = Array.isArray(config.opcoes) ? (config.opcoes as unknown[]).map(String) : [];
      const lines = opcoes.map((o) => `• ${o}`).join("\n");
      const parts = [titulo, lines].filter(Boolean);
      return parts.length ? parts.join("\n") : null;
    }
    case "pergunta":
      return str(config.pergunta) || null;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Conversa
// ---------------------------------------------------------------------------
async function getOrCreateConversation(
  supabase: SupabaseClient,
  flow: Row,
  contactId: string,
): Promise<string | undefined> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("contact_id", contactId)
    .eq("channel", flow.channel)
    .eq("status", "open")
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created } = await supabase
    .from("conversations")
    .insert({
      client_id: flow.client_id,
      contact_id: contactId,
      channel: flow.channel,
      status: "open",
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  return created?.id;
}

// ---------------------------------------------------------------------------
// Lógica / condições
// ---------------------------------------------------------------------------
async function evaluateLogicNode(
  supabase: SupabaseClient,
  flow: Row,
  contact: Row,
  blockId: string,
  config: Record<string, unknown>,
): Promise<boolean> {
  if (blockId === "verificar-tag") {
    const tagName = str(config.tag);
    if (!tagName) return false;
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("client_id", flow.client_id)
      .eq("name", tagName)
      .maybeSingle();
    if (!tag) return false;
    const { data: link } = await supabase
      .from("contact_tags")
      .select("contact_id")
      .eq("contact_id", contact.id)
      .eq("tag_id", tag.id)
      .maybeSingle();
    return !!link;
  }

  if (blockId === "ramificacao-aleatoria") {
    const pct = Number(config.percentagemA ?? 50);
    return Math.random() * 100 < pct;
  }

  // "condicao" (bloco por omissão desta categoria)
  const campo = str(config.campo);
  const operador = str(config.operador) || "existe";
  const valor = str(config.valor);
  const actual = await resolveContactFieldValue(supabase, flow.client_id, contact, campo);

  switch (operador) {
    case "igual":
      return (actual ?? "").trim().toLowerCase() === valor.trim().toLowerCase();
    case "contem":
      return typeof actual === "string" && actual.toLowerCase().includes(valor.toLowerCase());
    case "existe":
    default:
      return actual !== undefined && actual !== null && actual.trim() !== "";
  }
}

async function resolveContactFieldValue(
  supabase: SupabaseClient,
  clientId: string,
  contact: Row,
  campo: string,
): Promise<string | undefined> {
  if (campo === "nome") return contact.name ?? undefined;
  if (campo === "email") return contact.email ?? undefined;
  if (campo === "telefone") return contact.phone ?? undefined;
  if (!campo) return undefined;

  const { data: field } = await supabase
    .from("custom_fields")
    .select("id")
    .eq("client_id", clientId)
    .eq("key", campo)
    .maybeSingle();
  if (!field) return undefined;

  const { data: value } = await supabase
    .from("contact_field_values")
    .select("value")
    .eq("contact_id", contact.id)
    .eq("field_id", field.id)
    .maybeSingle();

  return value?.value ?? undefined;
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------
async function runAction(
  supabase: SupabaseClient,
  flow: Row,
  contact: Row,
  blockId: string,
  config: Record<string, unknown>,
): Promise<string> {
  const clientId = flow.client_id;
  const contactId = contact.id;

  switch (blockId) {
    case "adicionar-tag":
    case "remover-tag": {
      const tagName = str(config.tag);
      if (!tagName) return "Etiqueta não especificada";

      let tagId = (
        await supabase.from("tags").select("id").eq("client_id", clientId).eq("name", tagName).maybeSingle()
      ).data?.id;

      if (blockId === "adicionar-tag") {
        if (!tagId) {
          tagId = (
            await supabase.from("tags").insert({ client_id: clientId, name: tagName }).select("id").single()
          ).data?.id;
        }
        if (!tagId) return "Falha ao adicionar etiqueta";
        await supabase.from("contact_tags").upsert({ contact_id: contactId, tag_id: tagId });
        return `Etiqueta "${tagName}" adicionada ao contacto`;
      }

      if (!tagId) return "Etiqueta inexistente — nada a remover";
      await supabase.from("contact_tags").delete().eq("contact_id", contactId).eq("tag_id", tagId);
      return `Etiqueta "${tagName}" removida do contacto`;
    }

    case "atualizar-campo": {
      const campo = str(config.campo);
      const valor = str(config.valor);
      if (!campo) return "Campo não especificado";

      if (campo === "nome" || campo === "email" || campo === "telefone") {
        const column = campo === "nome" ? "name" : campo === "telefone" ? "phone" : "email";
        await supabase.from("contacts").update({ [column]: valor }).eq("id", contactId);
        return `Campo "${campo}" atualizado para "${valor}"`;
      }

      let fieldId = (
        await supabase.from("custom_fields").select("id").eq("client_id", clientId).eq("key", campo).maybeSingle()
      ).data?.id;
      if (!fieldId) {
        fieldId = (
          await supabase
            .from("custom_fields")
            .insert({ client_id: clientId, key: campo, label: campo })
            .select("id")
            .single()
        ).data?.id;
      }
      if (!fieldId) return "Falha ao atualizar campo";
      await supabase.from("contact_field_values").upsert({ contact_id: contactId, field_id: fieldId, value: valor });
      return `Campo "${campo}" atualizado para "${valor}"`;
    }

    case "adicionar-segmento": {
      const segmento = str(config.segmento);
      if (!segmento) return "Segmento não especificado";
      const { data: seg } = await supabase
        .from("segments")
        .select("id")
        .eq("client_id", clientId)
        .ilike("name", segmento)
        .maybeSingle();
      return seg
        ? `Segmento "${segmento}" identificado (segmentos são calculados por filtro nesta plataforma, não por associação manual)`
        : `Segmento "${segmento}" não encontrado`;
    }

    case "transferir-live-chat": {
      const conversationId = await getOrCreateConversation(supabase, flow, contactId);
      if (!conversationId) return "Falha ao transferir — sem conversa disponível";
      await supabase.from("conversations").update({ status: "pending" }).eq("id", conversationId);
      return "Conversa transferida para um agente humano";
    }

    case "notificacao-interna": {
      const destinatario = str(config.destinatario);
      const mensagem = str(config.mensagem) || `Novo evento no fluxo "${flow.name}"`;
      if (!destinatario) return "Destinatário não especificado";
      try {
        await sendEmailMessage(destinatario, mensagem, `Notificação: ${flow.name}`);
        return `Notificação interna enviada para ${destinatario}`;
      } catch (error) {
        return `Falha ao notificar equipa: ${error instanceof Error ? error.message : "erro desconhecido"}`;
      }
    }

    case "webhook": {
      const url = str(config.url);
      const metodo = (str(config.metodo) || "POST").toUpperCase();
      if (!url) return "URL do webhook não especificada";
      try {
        await fetch(url, {
          method: metodo,
          headers: metodo === "GET" ? undefined : { "Content-Type": "application/json" },
          body:
            metodo === "GET"
              ? undefined
              : JSON.stringify({
                  flowId: flow.id,
                  contact: { id: contact.id, name: contact.name, email: contact.email, phone: contact.phone },
                }),
        });
        return `Webhook chamado (${metodo} ${url})`;
      } catch (error) {
        return `Falha ao chamar webhook: ${error instanceof Error ? error.message : "erro desconhecido"}`;
      }
    }

    case "subscrever-sequencia": {
      const nomeSequencia = str(config.sequencia);
      if (!nomeSequencia) return "Sequência não especificada";
      const { data: seq } = await supabase
        .from("sequences")
        .select("id")
        .eq("client_id", clientId)
        .ilike("name", `%${nomeSequencia}%`)
        .maybeSingle();
      if (!seq) return `Sequência "${nomeSequencia}" não encontrada`;

      const { data: existing } = await supabase
        .from("sequence_enrollments")
        .select("id")
        .eq("sequence_id", seq.id)
        .eq("contact_id", contactId)
        .maybeSingle();
      if (existing) return "Contacto já estava inscrito nesta sequência";

      await supabase.from("sequence_enrollments").insert({ sequence_id: seq.id, contact_id: contactId });
      return `Contacto inscrito na sequência "${nomeSequencia}"`;
    }

    case "enviar-email": {
      const assunto = str(config.assunto) || "Nova mensagem";
      const corpo = str(config.corpo);
      if (!contact.email) return "Contacto sem endereço de email";
      try {
        await sendEmailMessage(contact.email, corpo, assunto);
        return `Email "${assunto}" enviado`;
      } catch (error) {
        return `Falha ao enviar email: ${error instanceof Error ? error.message : "erro desconhecido"}`;
      }
    }

    default:
      return `Ação "${blockId}" não reconhecida — ignorada`;
  }
}

// ---------------------------------------------------------------------------
// Deteção de fluxo ativo a partir de um evento de webhook
// ---------------------------------------------------------------------------
export async function findActiveFlowForTrigger(params: {
  supabase: SupabaseClient;
  clientId: string;
  channel: "whatsapp" | "instagram" | "email";
  triggerTypes: string[];
  messageText?: string;
}): Promise<Row | null> {
  const { supabase, clientId, channel, triggerTypes, messageText } = params;
  if (triggerTypes.length === 0) return null;

  const { data: flows } = await supabase
    .from("flows")
    .select("*")
    .eq("client_id", clientId)
    .eq("channel", channel)
    .eq("status", "active")
    .in("trigger_type", triggerTypes);

  if (!flows || flows.length === 0) return null;

  const KEYWORD_TRIGGERS = ["palavra-chave", "dm-palavra-chave", "comentario-publicacao"];
  const keywordFlows = (flows as Row[]).filter((f) => KEYWORD_TRIGGERS.includes(f.trigger_type));
  const text = (messageText ?? "").toLowerCase();

  for (const flow of keywordFlows) {
    const palavras = String(flow.trigger_config?.palavras ?? "")
      .split(",")
      .map((p: string) => p.trim().toLowerCase())
      .filter(Boolean);
    if (palavras.length > 0 && palavras.some((p) => text.includes(p))) {
      return flow;
    }
  }

  const nonKeywordFlow = (flows as Row[]).find((f) => !KEYWORD_TRIGGERS.includes(f.trigger_type));
  return nonKeywordFlow ?? null;
}
