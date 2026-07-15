import type { Channel, NodeKind } from "@/lib/flow-blocks";

export interface FlowNodeData {
  kind: NodeKind;
  blockId: string;
  label: string;
  channel: Channel;
  config: Record<string, unknown>;
  [key: string]: unknown;
}
