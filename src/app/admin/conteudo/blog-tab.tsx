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
import { cn } from "@/lib/utils";
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogPost } from "./_data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const emptyForm = { title: "", excerpt: "", category: BLOG_CATEGORIES[0], content: "" };

export function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditingId(post.id);
    setForm({ title: post.title, excerpt: post.excerpt, category: post.category, content: post.content });
    setDialogOpen(true);
  }

  function save() {
    if (!form.title.trim()) return;
    if (editingId) {
      setPosts((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...form } : p)));
      toast.success("Artigo atualizado");
    } else {
      const newPost: BlogPost = {
        id: `post-${Date.now()}`,
        ...form,
        publishedAt: new Date().toISOString(),
        status: "rascunho",
      };
      setPosts((prev) => [newPost, ...prev]);
      toast.success("Artigo criado como rascunho");
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Artigo removido");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Novo artigo</Button>} />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar artigo" : "Novo artigo"}</DialogTitle>
              <DialogDescription>Preenche os campos abaixo para {editingId ? "atualizar" : "criar"} o artigo do blog.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="blog-title">Título</Label>
                <Input id="blog-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="blog-excerpt">Excerto</Label>
                <Textarea id="blog-excerpt" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? BLOG_CATEGORIES[0] })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="blog-content">Conteúdo</Label>
                <Textarea id="blog-content" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={!form.title.trim()}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Publicado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="max-w-md truncate text-xs text-muted-foreground">{post.excerpt}</p>
                </TableCell>
                <TableCell><Badge variant="outline">{post.category}</Badge></TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("border-0", post.status === "publicado" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}
                  >
                    {post.status === "publicado" ? "Publicado" : "Rascunho"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(post)} aria-label="Editar artigo">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => remove(post.id)} aria-label="Remover artigo">
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
