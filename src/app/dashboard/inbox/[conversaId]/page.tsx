import { notFound } from "next/navigation";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ConversationView } from "@/components/inbox/conversation-view";
import { CONVERSAS } from "@/app/dashboard/inbox/_data";

export default async function InboxConversaPage({
  params,
}: {
  params: Promise<{ conversaId: string }>;
}) {
  const { conversaId } = await params;
  const conversa = CONVERSAS.find((c) => c.id === conversaId);

  if (!conversa) notFound();

  return (
    <div className="flex h-[calc(100vh-8.5rem)] overflow-hidden rounded-2xl ring-1 ring-border">
      <ConversationList className="hidden w-full max-w-xs border-r border-border md:flex" />

      <div className="flex flex-1">
        <ConversationView conversaInicial={conversa} />
      </div>
    </div>
  );
}
