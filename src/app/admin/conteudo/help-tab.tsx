"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { toastSaved } from "@/lib/toast";
import { HELP_ARTICLES, HELP_CATEGORIES, type HelpArticle } from "./_data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const emptyForm = { title: "", category: HELP_CATEGORIES[0], content: "" };

export function HelpTab() {
  const [articles, setArticles] = useState<HelpArticle[]>(HELP_ARTICLES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(article: HelpArticle) {
    setEditingId(article.id);
    setForm({ title: article.title, category: article.category, content: article.content });
    setDialogOpen(true);
  }

  function save() {
    if (!form.title.trim()) return;
    if (editingId) {
      setArticles((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...form, updatedAt: new Date().toISOString() } : a)));
      toastSaved("Artigo de ajuda atualizado");
    } else {
      const newArticle: HelpArticle = { id: `help-${Date.now()}`, ...form, updatedAt: new Date().toISOString() };
      setArticles((prev) => [newArticle, ...prev]);
      toast.success("Artigo de ajuda criado");
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    toast.success("Artigo removido");
  }

  const byCategory = HELP_CATEGORIES.map((category) => ({
    category,
    items: articles.filter((a) => a.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Novo artigo</Button>} />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar artigo" : "Novo artigo de ajuda"}</DialogTitle>
              <DialogDescription>Artigos aparecem na Central de Ajuda organizados por categoria.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="help-title">Título</Label>
                <Input id="help-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? HELP_CATEGORIES[0] })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HELP_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="help-content">Conteúdo</Label>
                <Textarea id="help-content" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={!form.title.trim()}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {byCategory.map((group) => (
        <div key={group.category} className="overflow-hidden rounded-2xl border border-border">
          <div className="border-b border-border bg-muted/40 px-4 py-2.5">
            <p className="text-sm font-medium">{group.category}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.items.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="text-sm font-medium">{article.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(article.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(article)} aria-label="Editar artigo">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => remove(article.id)} aria-label="Remover artigo">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
      {articles.length === 0 && <p className="text-sm text-muted-foreground">Nenhum artigo de ajuda criado ainda.</p>}
      <Badge variant="outline" className="w-fit border-0 bg-muted text-muted-foreground">
        {articles.length} artigos no total
      </Badge>
    </div>
  );
}
