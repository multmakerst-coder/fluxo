"use client";

import { useState } from "react";
import { Tags, Plus, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger, PopoverHeader, PopoverTitle } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TAG_COLORS, type Tag } from "./_data";

interface TagManagerProps {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagManager({ tags, onChange }: TagManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(TAG_COLORS[0].value);
  const [creating, setCreating] = useState(false);

  function startEdit(tag: Tag) {
    setEditingId(tag.id);
    setDraftName(tag.name);
    setDraftColor(tag.color);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setDraftName("");
    setDraftColor(TAG_COLORS[0].value);
  }

  function saveEdit() {
    if (!draftName.trim()) return;
    if (editingId) {
      onChange(tags.map((t) => (t.id === editingId ? { ...t, name: draftName.trim(), color: draftColor } : t)));
      toast.success("Tag atualizada");
      setEditingId(null);
    } else if (creating) {
      const id = draftName.trim().toLowerCase().replace(/\s+/g, "-");
      onChange([...tags, { id, name: draftName.trim(), color: draftColor }]);
      toast.success("Tag criada");
      setCreating(false);
    }
    setDraftName("");
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline">
            <Tags className="h-4 w-4" /> Gerir tags
          </Button>
        }
      />
      <PopoverContent className="w-80" align="end">
        <PopoverHeader>
          <PopoverTitle>Tags de contactos</PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-col gap-1.5">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between gap-2 rounded-lg px-1 py-1">
              {editingId === tag.id ? (
                <div className="flex flex-1 flex-col gap-2">
                  <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="h-7 text-xs" />
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setDraftColor(c.value)}
                        className="flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-border"
                        style={{ backgroundColor: c.value }}
                        aria-label={c.label}
                      >
                        {draftColor === c.value && <Check className="h-3 w-3 text-white" />}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" onClick={saveEdit} className="self-end">
                    Guardar
                  </Button>
                </div>
              ) : (
                <>
                  <Badge className="border-0" style={{ backgroundColor: `${tag.color}1a`, color: tag.color }}>
                    {tag.name}
                  </Badge>
                  <Button variant="ghost" size="icon-xs" onClick={() => startEdit(tag)} aria-label="Editar tag">
                    <Pencil className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        {creating ? (
          <div className="flex flex-col gap-2 border-t border-border pt-2.5">
            <Label className="text-xs">Nova tag</Label>
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Nome da tag"
              className="h-7 text-xs"
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              {TAG_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setDraftColor(c.value)}
                  className="flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-border"
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                >
                  {draftColor === c.value && <Check className="h-3 w-3 text-white" />}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={saveEdit} className="self-end">
              Criar tag
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={startCreate} className="mt-1">
            <Plus className="h-3.5 w-3.5" /> Nova tag
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
