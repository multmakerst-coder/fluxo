"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CanalSequencia, Sequencia } from "@/app/dashboard/sequencias/_data";
import { toast } from "sonner";

export function NovaSequenciaDialog({ onCriar }: { onCriar: (sequencia: Sequencia) => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [canal, setCanal] = useState<CanalSequencia>("whatsapp");

  function criar() {
    if (!nome.trim()) {
      toast.error("Dá um nome à sequência antes de continuar.");
      return;
    }
    const nova: Sequencia = {
      id: `seq-${Date.now()}`,
      nome: nome.trim(),
      canal,
      estado: "pausada",
      contactosAtivos: 0,
      taxaConclusao: 0,
      removerSeRespondeu: false,
      passos: [],
    };
    onCriar(nova);
    toast.success("Sequência criada.");
    setOpen(false);
    setNome("");
    setCanal("whatsapp");
    router.push(`/dashboard/sequencias/${nova.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button><Plus />Criar sequência</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar sequência</DialogTitle>
          <DialogDescription>Define o nome e o canal. Podes adicionar os passos a seguir.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome-sequencia">Nome</Label>
            <Input id="nome-sequencia" placeholder="Ex: Onboarding de novos clientes" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Canal</Label>
            <Select value={canal} onValueChange={(v) => setCanal(v as CanalSequencia)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={criar}>Criar sequência</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
