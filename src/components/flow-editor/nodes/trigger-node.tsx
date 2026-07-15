"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { Zap } from "lucide-react";
import { getTriggerDef, type Channel } from "@/lib/flow-blocks";
import { NodeShell, handleDotClass } from "./base-node";
import { getNodePreview } from "../utils";
import type { FlowNodeData } from "../types";
import { cn } from "@/lib/utils";

export function TriggerNode({ data, selected }: NodeProps<FlowNodeData>) {
  const trigger = getTriggerDef(data.channel as Channel, data.blockId);
  const Icon = trigger?.icon ?? Zap;

  return (
    <NodeShell
      kind="trigger"
      icon={Icon}
      title={data.label}
      subtitle={getNodePreview(data)}
      selected={selected}
      className="border-2"
    >
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn("size-2.5! rounded-full! border-2! border-background!", handleDotClass("trigger"))}
      />
    </NodeShell>
  );
}
