"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { Zap } from "lucide-react";
import { getBlockDef } from "@/lib/flow-blocks";
import { NodeShell, handleDotClass } from "./base-node";
import { getNodePreview } from "../utils";
import type { FlowNodeData } from "../types";
import { cn } from "@/lib/utils";

export function ActionNode({ data, selected }: NodeProps<FlowNodeData>) {
  const block = getBlockDef(data.blockId);
  const Icon = block?.icon ?? Zap;

  return (
    <NodeShell kind="acao" icon={Icon} title={data.label} subtitle={getNodePreview(data)} selected={selected}>
      <Handle
        type="target"
        position={Position.Top}
        className={cn("size-2.5! rounded-full! border-2! border-background!", handleDotClass("acao"))}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn("size-2.5! rounded-full! border-2! border-background!", handleDotClass("acao"))}
      />
    </NodeShell>
  );
}
