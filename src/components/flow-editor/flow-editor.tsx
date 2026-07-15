"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  PlayCircle,
  MessagesSquare,
  PanelRightClose,
  Pencil,
  Loader2,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CHANNEL_META,
  getBlockDef,
  getTriggersForChannel,
  getTriggerDef,
  type Channel,
} from "@/lib/flow-blocks";

import { nodeTypes } from "./nodes";
import { BlockPalette } from "./block-palette";
import { NodeInspector } from "./node-inspector";
import { ChatSimulator } from "./chat-simulator";
import type { FlowNodeData } from "./types";

let nodeIdCounter = 1;
function generateNodeId() {
  nodeIdCounter += 1;
  return `node-${Date.now()}-${nodeIdCounter}`;
}

function buildInitialFlow(channel: Channel): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const trigger = getTriggersForChannel(channel)[0];
  const messageBlock = getBlockDef("texto")!;

  const triggerNode: Node<FlowNodeData> = {
    id: "trigger-1",
    type: "trigger",
    position: { x: 40, y: 80 },
    data: {
      kind: "trigger",
      blockId: trigger.id,
      label: trigger.label,
      channel,
      config: {},
    },
  };

  const messageNode: Node<FlowNodeData> = {
    id: "node-1",
    type: "mensagem",
    position: { x: 40, y: 280 },
    data: {
      kind: "mensagem",
      blockId: messageBlock.id,
      label: messageBlock.label,
      channel,
      config: { texto: "Olá {{nome}}! Obrigado por entrares em contacto. 👋" },
    },
  };

  return {
    nodes: [triggerNode, messageNode],
    edges: [
      {
        id: "edge-1",
        source: "trigger-1",
        target: "node-1",
        type: "smoothstep",
        style: { stroke: "var(--color-primary)", strokeWidth: 2 },
      },
    ],
  };
}

const defaultEdgeOptions = {
  type: "smoothstep",
  style: { stroke: "var(--color-primary)", strokeWidth: 2 },
};

export function FlowEditor({ flowId, channel }: { flowId: string; channel: Channel }) {
  const initial = useMemo(() => buildInitialFlow(channel), [channel]);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<"inspector" | "simulator">("simulator");
  const [flowName, setFlowName] = useState(`Novo fluxo ${flowId.slice(0, 6)}`);
  const [isActive, setIsActive] = useState(false);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Carrega o fluxo persistido no Supabase (guardado através do botão "Guardar").
  // Se o fluxo ainda não existir (ex: id inválido), fica com a estrutura inicial
  // gerada localmente para que o utilizador consiga continuar a trabalhar.
  useEffect(() => {
    let cancelled = false;

    async function loadFlow() {
      try {
        const response = await fetch(`/api/flows/${flowId}`);
        if (!response.ok) {
          if (!cancelled) setIsLoading(false);
          return;
        }
        const { flow } = await response.json();
        if (cancelled || !flow) return;

        setFlowName(flow.name ?? flowName);
        setIsActive(flow.status === "active");
        if (Array.isArray(flow.nodes) && flow.nodes.length > 0) {
          setNodes(flow.nodes as Node<FlowNodeData>[]);
        }
        if (Array.isArray(flow.edges)) {
          setEdges(flow.edges as Edge[]);
        }
      } catch (error) {
        console.error("Erro ao carregar fluxo:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadFlow();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowId]);

  const channelMeta = CHANNEL_META[channel];
  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          { ...connection, type: "smoothstep", style: { stroke: "var(--color-primary)", strokeWidth: 2 } },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/fluxo-node");
      if (!raw || !rfInstance || !wrapperRef.current) return;

      const { kind, blockId } = JSON.parse(raw) as { kind: string; blockId: string };
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (kind === "trigger") {
        const triggerDef = getTriggerDef(channel, blockId);
        if (!triggerDef) return;
        setNodes((current) => [
          ...current.filter((n) => n.data.kind !== "trigger"),
          {
            id: "trigger-1",
            type: "trigger",
            position,
            data: { kind: "trigger", blockId, label: triggerDef.label, channel, config: {} },
          },
        ]);
        toast.info("Gatilho atualizado");
        return;
      }

      const blockDef = getBlockDef(blockId);
      if (!blockDef) return;

      const defaultConfig: Record<string, unknown> = {};
      blockDef.fields.forEach((field) => {
        if (field.defaultValue !== undefined) defaultConfig[field.key] = field.defaultValue;
      });

      const newNode: Node<FlowNodeData> = {
        id: generateNodeId(),
        type: blockDef.category,
        position,
        data: {
          kind: blockDef.category,
          blockId,
          label: blockDef.label,
          channel,
          config: defaultConfig,
        },
      };

      setNodes((current) => [...current, newNode]);
    },
    [rfInstance, channel, setNodes],
  );

  const onChangeConfig = useCallback(
    (nodeId: string, key: string, value: unknown) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, config: { ...node.data.config, [key]: value } } }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const onChangeLabel = useCallback(
    (nodeId: string, label: string) => {
      setNodes((current) =>
        current.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, label } } : node)),
      );
    },
    [setNodes],
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) => current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setSelectedNodeId(null);
      setRightPanel("simulator");
    },
    [setNodes, setEdges],
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: flowName, nodes, edges }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Erro ao guardar fluxo");
      }
      toast.success("Fluxo guardado", { description: `"${flowName}" foi guardado com sucesso.` });
    } catch (error) {
      toast.error("Não foi possível guardar o fluxo", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = () => {
    setRightPanel("simulator");
    setSelectedNodeId(null);
    toast.success("Mensagem de teste enviada", {
      description: "Verifica a pré-visualização da conversa ao lado (simulação — não envia mensagens reais).",
    });
  };

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked);
    try {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: checked ? "active" : "inactive" }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar o estado do fluxo");
      toast(checked ? "Fluxo ativado" : "Fluxo desativado", {
        description: checked ? "O fluxo já está a correr." : "O fluxo deixou de correr.",
      });
    } catch (error) {
      setIsActive(!checked);
      toast.error("Não foi possível atualizar o estado do fluxo", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] min-h-[560px] flex-col gap-3">
      {/* Top bar */}
      <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button nativeButton={false}
            variant="ghost"
            size="icon-sm"
            render={
              <Link href={`/dashboard/fluxos/${channel}`}>
                <ArrowLeft />
              </Link>
            }
          />
          <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
            <channelMeta.icon className="size-3" />
            {channelMeta.label}
          </Badge>
          <div className="flex min-w-0 items-center gap-1.5">
            <Pencil className="size-3.5 shrink-0 text-muted-foreground" />
            <Input
              value={flowName}
              onChange={(event) => setFlowName(event.target.value)}
              className="h-8 w-56 border-transparent bg-transparent px-1 font-heading text-sm font-medium hover:border-border focus-visible:border-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-border px-2.5 py-1.5">
            <Switch checked={isActive} onCheckedChange={handleToggleActive} size="sm" />
            <span className="text-xs font-medium text-muted-foreground">
              {isActive ? "Ativo" : "Inativo"}
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="outline" size="sm" onClick={handleTest}>
                  <PlayCircle /> Testar
                </Button>
              }
            />
            <TooltipContent>Envia uma mensagem de teste (simulação)</TooltipContent>
          </Tooltip>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Guardar
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 gap-3">
        <aside className="glass hidden w-64 shrink-0 rounded-2xl border md:block">
          <BlockPalette channel={channel} />
        </aside>

        <div
          ref={wrapperRef}
          className="glass relative min-w-0 flex-1 overflow-hidden rounded-2xl border"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              setRightPanel("inspector");
            }}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setRightPanel("simulator");
            }}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="var(--color-border)" />
            <Controls className="rounded-xl! border! border-border! bg-popover! text-foreground! [&_button]:border-border!" />
            <MiniMap
              className="rounded-xl! border! border-border! bg-popover!"
              maskColor="rgba(108,71,255,0.06)"
              nodeColor="var(--color-primary)"
            />
          </ReactFlow>

          <div className="absolute right-3 top-3 flex gap-1.5 md:hidden">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setRightPanel(rightPanel === "simulator" ? "inspector" : "simulator")}
            >
              <MessagesSquare />
            </Button>
          </div>
        </div>

        <aside className="hidden shrink-0 lg:block">
          {selectedNode && rightPanel === "inspector" ? (
            <NodeInspector
              node={selectedNode}
              channel={channel}
              onChangeConfig={onChangeConfig}
              onChangeLabel={onChangeLabel}
              onDelete={onDeleteNode}
              onClose={() => {
                setSelectedNodeId(null);
                setRightPanel("simulator");
              }}
            />
          ) : (
            <div className="relative h-full">
              <ChatSimulator nodes={nodes} edges={edges} channel={channel} />
              {selectedNode && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-3 top-3"
                  onClick={() => setRightPanel("inspector")}
                  title="Voltar às propriedades do bloco"
                >
                  <PanelRightClose />
                </Button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
