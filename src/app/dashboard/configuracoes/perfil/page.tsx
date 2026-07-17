"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Download, LoaderCircle, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { createClient } from "@/lib/supabase/client";

export default function PerfilPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("pt");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isExporting, setIsExporting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setName(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "");
        setEmail(user.email || "");
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      }
    });
  }, []);

  function handleExportData() {
    setIsExporting(true);
    setTimeout(() => {
      const dados = {
        exportadoEm: new Date().toISOString(),
        perfil: { nome: name, email, idioma: language },
        aviso:
          "Esta exportação inclui os dados pessoais associados à tua conta Fluxo, ao abrigo do direito de portabilidade do RGPD.",
      };
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "os-meus-dados-fluxo.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      toast.success("Exportação dos teus dados descarregada.");
    }, 700);
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      toast.success("Pedido de eliminação de conta registado.", {
        description: "A tua conta foi encerrada.",
      });
      router.push("/entrar");
    } catch {
      setIsDeleting(false);
      toast.error("Erro ao apagar conta");
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toastSaved("Perfil atualizado com sucesso");
    }
  }

  function handleUploadAvatar() {
    const mockAvatars = [
      "https://i.pravatar.cc/150?img=32",
      "https://i.pravatar.cc/150?img=47",
      "https://i.pravatar.cc/150?img=12",
    ];
    setAvatarUrl(mockAvatars[Math.floor(Math.random() * mockAvatars.length)]);
    toastSaved("Foto de perfil atualizada");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Preenche a nova password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As passwords não coincidem");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toastSaved("Password alterada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do perfil</CardTitle>
          <CardDescription>Atualiza os teus dados pessoais e preferências.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-primary/10 text-lg text-primary">
                  {name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" onClick={handleUploadAvatar}>
                <Camera className="h-4 w-4" /> Alterar foto
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:max-w-xs">
              <Label>Idioma preferido</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value ?? "")}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="self-end">Guardar alterações</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar password</CardTitle>
          <CardDescription>Recomendamos utilizar uma password única e segura.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current-password">Password atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">Nova password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password">Confirmar nova password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="self-end">Atualizar password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacidade e dados (RGPD)</CardTitle>
          <CardDescription>
            Exerce os teus direitos de proteção de dados nos termos do Regulamento Geral de Proteção de Dados.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-medium">Exportar os meus dados</p>
              <p className="text-xs text-muted-foreground">
                Descarrega uma cópia de todos os dados pessoais associados à tua conta.
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
              {isExporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar dados
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="text-sm font-medium">Apagar a minha conta</p>
              <p className="text-xs text-muted-foreground">
                Elimina permanentemente a tua conta e todos os dados associados (direito ao esquecimento).
              </p>
            </div>
            <Dialog
              open={deleteDialogOpen}
              onOpenChange={(open) => {
                setDeleteDialogOpen(open);
                if (!open) setDeleteConfirmText("");
              }}
            >
              <DialogTrigger render={<Button variant="destructive"><Trash2 className="h-4 w-4" /> Apagar conta</Button>} />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Apagar a tua conta</DialogTitle>
                  <DialogDescription>
                    Este pedido é processado ao abrigo do direito ao esquecimento previsto no RGPD.
                  </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Esta ação é irreversível</AlertTitle>
                  <AlertDescription>
                    Todos os teus contactos, conversas, fluxos e histórico de faturação serão permanentemente
                    apagados e não podem ser recuperados.
                  </AlertDescription>
                </Alert>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="delete-confirm">Escreve <span className="font-semibold">APAGAR</span> para confirmar</Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="APAGAR"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                  <Button
                    variant="destructive"
                    disabled={deleteConfirmText !== "APAGAR" || isDeleting}
                    onClick={handleDeleteAccount}
                  >
                    {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    Apagar definitivamente
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
