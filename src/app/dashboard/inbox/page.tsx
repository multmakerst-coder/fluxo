import { MessagesSquare } from "lucide-react";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ConversationView } from "@/components/inbox/conversation-view";
import { CONVERSAS } from "@/app/dashboard/inbox/_data";

export default function InboxPage() {
  const primeiraConversa = CONVERSAS.find((c) => !c.arquivada);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] overflow-hidden rounded-2xl ring-1 ring-border">
      <ConversationList className="w-full max-w-xs border-r border-border" />

      <div className="hidden flex-1 lg:flex">
        {primeiraConversa ? (
          <ConversationView conversaInicial={primeiraConversa} />
        ) : (
          <EstadoVazio />
        )}
      </div>

      <div className="hidden flex-1 items-center justify-center md:flex lg:hidden">
        <EstadoVazio />
      </div>
    </div>
  );
}

function EstadoVazio() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <MessagesSquare className="h-6 w-6" />
      </div>
      <div>
        <p className="font-heading text-base font-medium">Seleciona uma conversa</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Escolhe uma conversa na lista à esquerda para ver o histórico completo.
        </p>
      </div>
    </div>
  );
}
