import { getBlockDef, getTriggerDef, type Channel } from "@/lib/flow-blocks";
import type { FlowNodeData } from "./types";

/** Produces a short human-readable preview of a node's configuration. */
export function getNodePreview(data: FlowNodeData): string | undefined {
  const { blockId, config, channel, kind } = data;

  if (kind === "trigger") {
    const trigger = getTriggerDef(channel as Channel, blockId);
    if (!trigger) return undefined;
    const firstField = trigger.fields[0];
    if (firstField && config[firstField.key]) {
      return String(config[firstField.key]);
    }
    return trigger.description;
  }

  const block = getBlockDef(blockId);
  if (!block) return undefined;

  switch (blockId) {
    case "texto":
      return (config.texto as string) || block.description;
    case "imagem":
    case "video":
    case "audio":
    case "documento":
      return (config.legenda as string) || (config.url as string) || block.description;
    case "botoes": {
      const botoes = (config.botoes as string[]) ?? [];
      return botoes.length ? `Botões: ${botoes.join(" · ")}` : block.description;
    }
    case "condicao": {
      const campo = config.campo as string;
      const operador = config.operador as string;
      const valor = config.valor as string;
      if (campo) return `SE ${campo} ${operador ?? "="} ${valor ?? "..."}`;
      return block.description;
    }
    case "resposta-ia":
      return (config.instrucoes as string) || block.description;
    default: {
      const firstField = block.fields[0];
      if (firstField && config[firstField.key]) {
        const value = config[firstField.key];
        if (Array.isArray(value)) return value.join(", ");
        return String(value);
      }
      return block.description;
    }
  }
}
