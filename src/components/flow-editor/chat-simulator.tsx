"use client";

import { Sparkles, GitBranch, Zap } from "lucide-react";
import type { Edge, Node } from "reactflow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CHANNEL_META, type Channel } from "@/lib/flow-blocks";
import type { FlowNodeData } from "./types";
import { getNodePreview } from "./utils";

/** Walks the graph from the trigger node following the first outgoing edge at each step. */
function buildSequence(nodes: Node<FlowNodeData>[], edges: Edge[]): Node<FlowNodeData>[] {
  const trigger = nodes.find((n) => n.data.kind === "trigger");
  if (!trigger) return [];

  const sequence: Node<FlowNodeData>[] = [];
  const visited = new Set<string>();
  let current: Node<FlowNodeData> | undefined = trigger;

  while (current && !visited.has(current.id) && sequence.length < 25) {
    visited.add(current.id);
    sequence.push(current);
    const nextEdge = edges.find((e) => e.source === current!.id);
    current = nextEdge ? nodes.find((n) => n.id === nextEdge.target) : undefined;
  }

  return sequence;
}

export function ChatSimulator({
  nodes,
  edges,
  channel,
}: {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  channel: Channel;
}) {
  const sequence = buildSequence(nodes, edges);
  const ChannelIcon = CHANNEL_META[channel].icon;

  return (
    <div className="glass flex h-full w-80 flex-col rounded-2xl border">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <ChannelIcon className="size-3.5 text-primary" />
        </span>
        <div>
          <p className="text-xs font-medium text-foreground">Simulador de conversa</p>
          <p className="text-[11px] text-muted-foreground">Pré-visualização do fluxo em {CHANNEL_META[channel].label}</p>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {sequence.length === 0 && (
            <p className="rounded-lg bg-muted px-3 py-4 text-center text-xs text-muted-foreground">
              Liga o gatilho aos blocos para veres a pré-visualização da conversa.
            </p>
          )}
          {sequence.map((node) => (
            <SimulatorBubble key={node.id} node={node} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function SimulatorBubble({ node }: { node: Node<FlowNodeData> }) {
  const preview = getNodePreview(node.data);

  if (node.data.kind === "trigger") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-[11px] text-muted-foreground">
        <Zap className="size-3 shrink-0 text-primary" />
        <span>
          Gatilho: <span className="font-medium text-foreground">{node.data.label}</span>
        </span>
      </div>
    );
  }

  if (node.data.kind === "logica") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-[11px] text-warning">
        <GitBranch className="size-3 shrink-0" />
        <span>{node.data.label}</span>
      </div>
    );
  }

  if (node.data.kind === "acao") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-[11px] text-success">
        <Sparkles className="size-3 shrink-0" />
        <span>{node.data.label}</span>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 text-xs shadow-sm",
          node.data.kind === "ia" ? "bg-gradient-to-br from-primary to-brand-accent text-primary-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        {node.data.kind === "ia" && (
          <p className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide opacity-80">
            <Sparkles className="size-2.5" /> Resposta IA
          </p>
        )}
        <p className="whitespace-pre-wrap">{preview || node.data.label}</p>
      </div>
    </div>
  );
}
