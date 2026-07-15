"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Camera, Mail, Users, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovaSequenciaDialog } from "@/components/sequencias/nova-sequencia-dialog";
import { SEQUENCIAS, badgeEstadoSequencia, labelCanal, type Sequencia } from "@/app/dashboard/sequencias/_data";
import { cn } from "@/lib/utils";

const ICONE_CANAL = {
  whatsapp: MessageCircle,
  instagram: Camera,
  email: Mail,
} as const;

export default function SequenciasPage() {
  const [sequencias, setSequencias] = useState<Sequencia[]>(SEQUENCIAS);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Sequências</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cria séries de mensagens automáticas enviadas ao longo do tempo.
          </p>
        </div>
        <NovaSequenciaDialog onCriar={(nova) => setSequencias((prev) => [nova, ...prev])} />
      </div>

      <div className="overflow-hidden rounded-2xl ring-1 ring-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Passos</TableHead>
              <TableHead>Contactos ativos</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sequencias.map((seq) => {
              const Icone = ICONE_CANAL[seq.canal];
              const estado = badgeEstadoSequencia(seq.estado);
              return (
                <TableRow key={seq.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/sequencias/${seq.id}`} className="hover:text-primary">
                      {seq.nome}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Icone className="h-3.5 w-3.5" />
                      {labelCanal(seq.canal)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5" />
                      {seq.passos.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {seq.contactosAtivos.toLocaleString("pt-PT")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(estado.className)}>{estado.label}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {sequencias.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Ainda não tens sequências. Cria a primeira para começar a automatizar o teu acompanhamento.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
