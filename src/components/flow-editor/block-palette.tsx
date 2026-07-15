"use client";

import type { DragEvent } from "react";
import { Zap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  getBlocksForChannel,
  getTriggersForChannel,
  type BlockCategory,
  type Channel,
} from "@/lib/flow-blocks";

const CATEGORY_ORDER: BlockCategory[] = ["mensagem", "interacao", "logica", "acao", "ia"];

export function BlockPalette({ channel }: { channel: Channel }) {
  const blocks = getBlocksForChannel(channel);
  const triggers = getTriggersForChannel(channel);

  const onDragStartBlock = (event: DragEvent<HTMLDivElement>, blockId: string, category: BlockCategory) => {
    event.dataTransfer.setData(
      "application/fluxo-node",
      JSON.stringify({ kind: category, blockId }),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragStartTrigger = (event: DragEvent<HTMLDivElement>, triggerId: string) => {
    event.dataTransfer.setData(
      "application/fluxo-node",
      JSON.stringify({ kind: "trigger", blockId: triggerId }),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-3">
        <div>
          <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Zap className="size-3" /> Gatilhos
          </p>
          <div className="space-y-1.5">
            {triggers.map((trigger) => (
              <div
                key={trigger.id}
                draggable
                onDragStart={(event) => onDragStartTrigger(event, trigger.id)}
                className={cn(
                  "glass flex cursor-grab items-start gap-2 rounded-xl border p-2 text-left transition-transform active:cursor-grabbing hover:-translate-y-0.5",
                  CATEGORY_META.trigger.border,
                )}
              >
                <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-lg", CATEGORY_META.trigger.bg)}>
                  <trigger.icon className={cn("size-3.5", CATEGORY_META.trigger.text)} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{trigger.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{trigger.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Accordion defaultValue={["mensagem"]} className="gap-0">
          {CATEGORY_ORDER.map((category) => {
            const categoryBlocks = blocks.filter((block) => block.category === category);
            if (categoryBlocks.length === 0) return null;
            const meta = CATEGORY_META[category];
            return (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="px-1 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", meta.dot)} />
                    {meta.label}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-0">
                  <div className="space-y-1.5">
                    {categoryBlocks.map((block) => (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(event) => onDragStartBlock(event, block.id, block.category)}
                        className={cn(
                          "glass flex cursor-grab items-start gap-2 rounded-xl border p-2 text-left transition-transform active:cursor-grabbing hover:-translate-y-0.5",
                          meta.border,
                        )}
                      >
                        <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-lg", meta.bg)}>
                          <block.icon className={cn("size-3.5", meta.text)} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground">{block.label}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{block.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </ScrollArea>
  );
}
