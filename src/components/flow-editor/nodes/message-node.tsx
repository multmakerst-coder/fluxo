"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { MessageSquare } from "lucide-react";
import { getBlockDef } from "@/lib/flow-blocks";
import { NodeShell, handleDotClass } from "./base-node";
import { getNodePreview } from "../utils";
import type { FlowNodeData } from "../types";
import { cn } from "@/lib/utils";

/** Renders "mensagem" and "interacao" category blocks. */
export function MessageNode({ data, selected }: NodeProps<FlowNodeData>) {
  const block = getBlockDef(data.blockId);
  const Icon = block?.icon ?? MessageSquare;
  const kind = data.kind === "interacao" ? "interacao" : "mensagem";

  return (
    <NodeShell kind={kind} icon={Icon} title={data.label} subtitle={getNodePreview(data)} selected={selected}>
      <Handle
        type="target"
        position={Position.Top}
        className={cn("size-2.5! rounded-full! border-2! border-background!", handleDotClass(kind))}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn("size-2.5! rounded-full! border-2! border-background!", handleDotClass(kind))}
      />
    </NodeShell>
  );
}
