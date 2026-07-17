"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toastSaved } from "@/lib/toast";
import { FAQS, type Faq } from "./_data";

const emptyForm = { question: "", answer: "", category: "" };

export function FaqsTab() {
  const [faqs, setFaqs] = useState<Faq[]>(FAQS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(faq: Faq) {
    setEditingId(faq.id);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category });
    setDialogOpen(true);
  }

  function save() {
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editingId) {
      setFaqs((prev) => prev.map((f) => (f.id === editingId ? { ...f, ...form } : f)));
      toastSaved("Pergunta frequente atualizada");
    } else {
      const newFaq: Faq = { id: `faq-${Date.now()}`, ...form, category: form.category || "Geral" };
      setFaqs((prev) => [newFaq, ...prev]);
      toast.success("Pergunta frequente criada");
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast.success("Pergunta frequente removida");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Nova FAQ</Button>} />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar FAQ" : "Nova pergunta frequente"}</DialogTitle>
              <DialogDescription>Estas FAQs aparecem na página pública de perguntas frequentes.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="faq-category">Categoria</Label>
                <Input id="faq-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Faturação" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="faq-question">Pergunta</Label>
                <Input id="faq-question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="faq-answer">Resposta</Label>
                <Textarea id="faq-answer" rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={!form.question.trim() || !form.answer.trim()}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{faq.question}</p>
                <Badge variant="outline">{faq.category}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(faq)} aria-label="Editar FAQ">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => remove(faq.id)} aria-label="Remover FAQ">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma FAQ criada ainda.</p>}
      </div>
    </div>
  );
}
