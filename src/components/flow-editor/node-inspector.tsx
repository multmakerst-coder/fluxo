"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  getBlockDef,
  getTriggerDef,
  type Channel,
  type ConfigField,
} from "@/lib/flow-blocks";
import type { Node } from "reactflow";
import type { FlowNodeData } from "./types";

export function NodeInspector({
  node,
  channel,
  onChangeConfig,
  onChangeLabel,
  onDelete,
  onClose,
}: {
  node: Node<FlowNodeData>;
  channel: Channel;
  onChangeConfig: (nodeId: string, key: string, value: unknown) => void;
  onChangeLabel: (nodeId: string, label: string) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}) {
  const { data } = node;
  const def = data.kind === "trigger" ? getTriggerDef(channel, data.blockId) : getBlockDef(data.blockId);
  const meta = CATEGORY_META[data.kind];
  const fields: ConfigField[] = def?.fields ?? [];

  return (
    <div className="glass flex h-full w-80 flex-col rounded-2xl border">
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", meta.bg)}>
            {def && <def.icon className={cn("size-3.5", meta.text)} />}
          </span>
          <div className="min-w-0">
            <p className={cn("text-[10px] font-semibold uppercase tracking-wide", meta.text)}>{meta.label}</p>
            <p className="truncate text-xs text-muted-foreground">{def?.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-1.5">
          <Label htmlFor="node-label">Nome do bloco</Label>
          <Input
            id="node-label"
            value={data.label}
            onChange={(event) => onChangeLabel(node.id, event.target.value)}
          />
        </div>

        {fields.length === 0 && (
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            Este bloco não tem propriedades adicionais para configurar.
          </p>
        )}

        {fields.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={data.config[field.key] ?? field.defaultValue}
            onChange={(value) => onChangeConfig(node.id, field.key, value)}
          />
        ))}
      </div>

      {data.kind !== "trigger" && (
        <>
          <Separator />
          <div className="p-3">
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => onDelete(node.id)}
            >
              <Trash2 /> Eliminar bloco
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case "text":
      return (
        <FieldWrap field={field}>
          <Input
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        </FieldWrap>
      );
    case "textarea":
      return (
        <FieldWrap field={field}>
          <Textarea
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            rows={3}
            onChange={(event) => onChange(event.target.value)}
          />
        </FieldWrap>
      );
    case "number":
      return (
        <FieldWrap field={field}>
          <Input
            type="number"
            value={(value as number) ?? 0}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        </FieldWrap>
      );
    case "select":
      return (
        <FieldWrap field={field}>
          <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleciona uma opção" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrap>
      );
    case "switch":
      return (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
          <div>
            <Label>{field.label}</Label>
            {field.helperText && <p className="mt-0.5 text-[11px] text-muted-foreground">{field.helperText}</p>}
          </div>
          <Switch checked={Boolean(value)} onCheckedChange={(checked) => onChange(checked)} />
        </div>
      );
    case "list":
      return <ListFieldRenderer field={field} value={(value as string[]) ?? []} onChange={onChange} />;
    default:
      return null;
  }
}

function FieldWrap({ field, children }: { field: ConfigField; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{field.label}</Label>
      {children}
      {field.helperText && <p className="text-[11px] text-muted-foreground">{field.helperText}</p>}
    </div>
  );
}

function ListFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const items = value.length ? value : [""];
  const atMax = field.maxItems ? items.length >= field.maxItems : false;

  const updateItem = (index: number, next: string) => {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  };

  const removeItem = (index: number) => {
    const copy = items.filter((_, i) => i !== index);
    onChange(copy.length ? copy : [""]);
  };

  const addItem = () => {
    if (atMax) return;
    onChange([...items, ""]);
  };

  return (
    <div className="space-y-1.5">
      <Label>{field.label}</Label>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <Input
              value={item}
              placeholder={`Item ${index + 1}`}
              onChange={(event) => updateItem(index, event.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={atMax}>
        Adicionar item
      </Button>
      {field.helperText && <p className="text-[11px] text-muted-foreground">{field.helperText}</p>}
    </div>
  );
}
