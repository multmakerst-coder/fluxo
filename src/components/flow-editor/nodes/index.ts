import type { NodeTypes } from "reactflow";
import { TriggerNode } from "./trigger-node";
import { MessageNode } from "./message-node";
import { ConditionNode } from "./condition-node";
import { ActionNode } from "./action-node";
import { AiNode } from "./ai-node";

export const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  mensagem: MessageNode,
  interacao: MessageNode,
  logica: ConditionNode,
  acao: ActionNode,
  ia: AiNode,
};

export { TriggerNode, MessageNode, ConditionNode, ActionNode, AiNode };
