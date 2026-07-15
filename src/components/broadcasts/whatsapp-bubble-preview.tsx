import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsAppBubblePreview({ texto, className }: { texto: string; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[#0b141a] p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/70">
        <MessageCircle className="h-3.5 w-3.5" />
        Pré-visualização WhatsApp
      </div>
      <div className="max-w-[85%] rounded-xl rounded-tl-none bg-[#202c33] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-white/90 shadow">
        {texto || "A tua mensagem vai aparecer aqui..."}
      </div>
    </div>
  );
}
