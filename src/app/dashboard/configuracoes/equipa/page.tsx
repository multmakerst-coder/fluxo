"use client";

import { useState } from "react";
import { UserPlus, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Role = "admin" | "agente" | "leitura";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ativo" | "convite pendente";
}

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  agente: "Agente",
  leitura: "Apenas leitura",
};

const INITIAL_MEMBERS: Member[] = [
  { id: "m1", name: "Marta Silva", email: "marta@negocio.pt", role: "admin", status: "ativo" },
  { id: "m2", name: "Carlos Mendes", email: "carlos@negocio.pt", role: "agente", status: "ativo" },
  { id: "m3", name: "Sara Nogueira", email: "sara@negocio.pt", role: "leitura", status: "ativo" },
  { id: "m4", name: "Rui Barros", email: "rui@negocio.pt", role: "agente", status: "convite pendente" },
];

const PLAN_ALLOWS_TEAM = true;

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function EquipaPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("agente");

  function inviteMember() {
    if (!inviteEmail.trim()) return;
    setMembers((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: inviteEmail.split("@")[0].replace(/[._]/g, " "),
        email: inviteEmail.trim(),
        role: inviteRole,
        status: "convite pendente",
      },
    ]);
    toast.success(`Convite enviado para ${inviteEmail}`);
    setInviteEmail("");
    setInviteRole("agente");
    setInviteOpen(false);
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success("Membro removido da equipa");
  }

  if (!PLAN_ALLOWS_TEAM) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equipa</CardTitle>
          <CardDescription>Esta funcionalidade está disponível apenas no plano Empresas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Faz upgrade para o plano Empresas para convidar membros da equipa.</p>
          <Button>Ver planos</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Equipa</CardTitle>
          <CardDescription>Gere quem tem acesso à conta da tua empresa.</CardDescription>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger render={<Button><UserPlus className="h-4 w-4" /> Convidar membro</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar membro para a equipa</DialogTitle>
              <DialogDescription>Envia um convite por email com a função escolhida.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nome@empresa.pt"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Função</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="agente">Agente</SelectItem>
                    <SelectItem value="leitura">Apenas leitura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Cancelar</Button>} />
              <Button onClick={inviteMember}>Enviar convite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-primary/10 text-primary">{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ROLE_LABEL[member.role]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "border-0",
                      member.status === "ativo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
                    )}
                  >
                    {member.status === "ativo" ? "Ativo" : "Convite pendente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remover membro"
                    onClick={() => removeMember(member.id)}
                    disabled={member.role === "admin" && members.filter((m) => m.role === "admin").length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
