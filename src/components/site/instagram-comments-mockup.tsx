"use client";

import { motion } from "motion/react";
import { Heart, MessageCircle, Send, Bookmark, Zap } from "lucide-react";
import { PhoneFrame } from "@/components/site/phone-frame";

// Mockup ilustrativo (não é uma captura de ecrã real do Instagram) que mostra um
// comentário de um seguidor a receber uma resposta automática pública e, de seguida,
// uma DM automática — para ilustrar a automação de comentários/DMs do Fluxo.
export function InstagramCommentsMockup() {
  return (
    <PhoneFrame>
      <div className="flex items-center gap-2 border-b border-border px-3 py-3 pt-8">
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]" />
        <p className="text-sm font-semibold">estudio.nortada</p>
      </div>

      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#f09433]/20 via-[#e6683c]/20 to-[#bc1888]/20">
        <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-neutral-600 dark:bg-black/40 dark:text-neutral-200">
          Novo lançamento ✨
        </span>
      </div>

      <div className="flex items-center gap-4 px-3 py-2.5 text-neutral-700 dark:text-neutral-200">
        <Heart className="h-5 w-5" strokeWidth={1.75} />
        <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
        <Send className="h-5 w-5" strokeWidth={1.75} />
        <Bookmark className="ml-auto h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="px-3 text-[11px] text-muted-foreground">482 gostos</p>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-3 py-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="flex gap-2"
        >
          <span className="h-6 w-6 shrink-0 rounded-full bg-muted" />
          <p className="text-[12px]">
            <span className="font-semibold">carla.nunes</span>{" "}
            <span className="text-neutral-700 dark:text-neutral-200">Qual o preço deste? 😍</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.35 }}
          className="ml-4 flex gap-2 rounded-xl bg-primary/5 p-2"
        >
          <span className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-primary to-brand-accent" />
          <div className="text-[12px]">
            <span className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-primary">
              <Zap className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
              Resposta automática
            </span>
            <p className="text-neutral-700 dark:text-neutral-200">
              <span className="font-semibold">estudio.nortada</span> Olá Carla! Enviámos-te os detalhes por DM 💌
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.9, duration: 0.35 }}
          className="mt-auto flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2.5"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
            <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
          </span>
          <div className="text-[11px]">
            <p className="font-semibold text-primary">DM enviada automaticamente</p>
            <p className="text-muted-foreground">
              &ldquo;Aqui está o preço e o link direto para comprares 🛍️&rdquo;
            </p>
          </div>
        </motion.div>
      </div>
    </PhoneFrame>
  );
}
