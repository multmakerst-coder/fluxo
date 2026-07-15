"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { MessageCircle, Camera, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONVERSAS, ultimaMensagem } from "@/app/dashboard/inbox/_data";
import { cn } from "@/lib/utils";

const ICONE_CANAL = {
  whatsapp: MessageCircle,
  instagram: Camera,
  email: Mail,
} as const;

type Filtro = "todas" | "nao-lidas" | "minhas" | "arquivadas";

export function ConversationList({
  className,
}: {
  className?: string;
}) {
  const pathname = usePathname();
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const activeId = useMemo(() => {
    const match = pathname.match(/\/dashboard\/inbox\/(.+)$/);
    return match ? match[1] : null;
  }, [pathname]);

  const conversas = useMemo(() => {
    return CONVERSAS.filter((c) => {
      if (filtro === "todas") return !c.arquivada;
      if (filtro === "nao-lidas") return c.naoLida && !c.arquivada;
      if (filtro === "minhas") return c.atribuidaAMim && !c.arquivada;
      if (filtro === "arquivadas") return c.arquivada;
      return true;
    }).sort((a, b) => {
      const ma = ultimaMensagem(a)?.hora ?? "";
      const mb = ultimaMensagem(b)?.hora ?? "";
      return mb.localeCompare(ma);
    });
  }, [filtro]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="border-b border-border p-3">
        <Tabs value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
          <TabsList className="w-full">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="nao-lidas">Não lidas</TabsTrigger>
            <TabsTrigger value="minhas">Minhas</TabsTrigger>
            <TabsTrigger value="arquivadas">Arquivo</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {conversas.map((conversa) => {
            const Icone = ICONE_CANAL[conversa.canal];
            const ultima = ultimaMensagem(conversa);
            const ativa = conversa.id === activeId;
            return (
              <Link
                key={conversa.id}
                href={`/dashboard/inbox/${conversa.id}`}
                className={cn(
                  "flex items-start gap-3 border-b border-border/60 px-4 py-3 transition-colors hover:bg-muted/60",
                  ativa && "bg-accent",
                )}
              >
                <div className="relative shrink-0">
                  <Avatar>
                    <AvatarFallback>{conversa.avatarIniciais}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-background ring-1 ring-border">
                    <Icone className="size-2.5 text-muted-foreground" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm", conversa.naoLida ? "font-semibold" : "font-medium")}>
                      {conversa.contactoNome}
                    </p>
                    {ultima && (
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {format(new Date(ultima.hora), "HH:mm", { locale: pt })}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {ultima?.texto ?? "Sem mensagens"}
                  </p>
                </div>
                {conversa.naoLida && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}
              </Link>
            );
          })}
          {conversas.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Sem conversas nesta vista.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
