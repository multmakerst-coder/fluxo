"use client";

import { useId, useState } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toastSaved } from "@/lib/toast";

interface LockedFieldProps {
  label?: string;
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  type?: string;
  description?: string;
  savedMessage?: string;
  emptyLabel?: string;
  className?: string;
}

/**
 * Campo de definição com padrão "guardar → bloqueado".
 *
 * Enquanto não há valor guardado (ou o utilizador clica em "Editar"), mostra um
 * input editável com botão "Guardar". Depois de guardado, o campo fica bloqueado
 * (só leitura) com um selo "Salvo" e um botão de lápis para o voltar a editar —
 * evita que definições já confirmadas fiquem "soltas" num input sempre editável.
 */
export function LockedField({
  label,
  value,
  onSave,
  placeholder,
  type = "text",
  description,
  savedMessage = "Salvo",
  emptyLabel = "Não definido",
  className,
}: LockedFieldProps) {
  const id = useId();
  const [editing, setEditing] = useState(!value);
  const [draft, setDraft] = useState(value);
  const [current, setCurrent] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onSave(trimmed);
      setCurrent(trimmed);
      setEditing(false);
      toastSaved(savedMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            id={id}
            type={type}
            value={draft}
            placeholder={placeholder}
            disabled={saving}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
          <Button size="sm" onClick={handleSave} disabled={saving || !draft.trim()}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Guardar"}
          </Button>
          {current && (
            <Button
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setDraft(current);
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
          <span className={cn("truncate text-sm", !current && "text-muted-foreground")}>{current || emptyLabel}</span>
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <Check className="h-3.5 w-3.5" strokeWidth={2.25} /> Salvo
            </span>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={label ? `Editar ${label}` : "Editar campo"}
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
