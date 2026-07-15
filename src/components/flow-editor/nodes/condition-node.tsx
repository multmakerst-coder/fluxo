"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { GitBranch } from "lucide-react";
import { getBlockDef } from "@/lib/flow-blocks";
import { NodeShell, handleDotClass } from "./base-node";
import { getNodePreview } from "../utils";
import type { FlowNodeData } from "../types";
import { cn } from "@/lib/utils";

function getBranchLabels(blockId: string): [string, string] {
  if (blockId === "ramificacao-aleatoria") return ["A", "B"];
  if (blockId === "verificar-tag") return ["Tem tag", "Não tem"];
  return ["Sim", "Não"];
}

export function ConditionNode({ data, selected }: NodeProps<FlowNodeData>) {
  const block = getBlockDef(data.blockId);
  const Icon = block?.icon ?? GitBranch;
  const [labelA, labelB] = getBranchLabels(data.blockId);

  return (
    <NodeShell kind="logica" icon={Icon} title={data.label} subtitle={getNodePreview(data)} selected={selected}>
      <Handle
        type="target"
        position={Position.Top}
        className={cn("size-2.5! rounded-full! border-2! border-background!", handleDotClass("logica"))}
      />
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-warning/20 pt-2 text-[10px] font-medium text-warning">
        <span>{labelA}</span>
        <span>{labelB}</span>
      </div>
      <Handle
        type="source"
        id="a"
        position={Position.Bottom}
        style={{ left: "25%" }}
        className={cn("size-2.5! rounded-full! border-2! border-background!", handleDotClass("logica"))}
      />
      <Handle
        type="source"
        id="b"
        position={Position.Bottom}
        style={{ left: "75%" }}
        className={cn("size-2.5! rounded-full! border-2! border-background!", handleDotClass("logica"))}
      />
    </NodeShell>
  );
}
