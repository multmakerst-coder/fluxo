"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TESTIMONIALS, type Testimonial } from "./_data";

const emptyForm = { name: "", role: "", company: "", quote: "", featured: false };

export function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditingId(t.id);
    setForm({ name: t.name, role: t.role, company: t.company, quote: t.quote, featured: t.featured });
    setDialogOpen(true);
  }

  function save() {
    if (!form.name.trim() || !form.quote.trim()) return;
    if (editingId) {
      setTestimonials((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...form } : t)));
      toast.success("Depoimento atualizado");
    } else {
      const newTestimonial: Testimonial = { id: `test-${Date.now()}`, ...form };
      setTestimonials((prev) => [newTestimonial, ...prev]);
      toast.success("Depoimento criado");
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    toast.success("Depoimento removido");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Novo depoimento</Button>} />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar depoimento" : "Novo depoimento"}</DialogTitle>
              <DialogDescription>Depoimentos em destaque aparecem na página inicial do Fluxo.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="test-name">Nome</Label>
                  <Input id="test-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="test-role">Cargo</Label>
                  <Input id="test-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="test-company">Empresa</Label>
                <Input id="test-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="test-quote">Depoimento</Label>
                <Textarea id="test-quote" rows={3} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5">
                <Label htmlFor="test-featured" className="text-sm font-normal">Destacar na página inicial</Label>
                <Switch id="test-featured" checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={!form.name.trim() || !form.quote.trim()}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Destaque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-sm font-medium">{t.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.role}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.company}</TableCell>
                <TableCell>
                  {t.featured ? (
                    <Badge variant="outline" className={cn("gap-1 border-0 bg-warning/10 text-warning")}>
                      <Star className="h-3 w-3" /> Destaque
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(t)} aria-label="Editar depoimento">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => remove(t.id)} aria-label="Remover depoimento">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
