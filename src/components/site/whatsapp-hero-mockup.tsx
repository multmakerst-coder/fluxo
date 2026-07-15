"use client";

import { motion } from "motion/react";
import { Check, CheckCheck, Zap } from "lucide-react";
import { PhoneFrame } from "@/components/site/phone-frame";

// Mockup ilustrativo (não é uma captura de ecrã real do WhatsApp) que anima a chegada
// de uma mensagem de cliente seguida de uma resposta automática do Fluxo, para que
// quem visita a homepage perceba de imediato para que serve o produto.
const MESSAGES = [
  { from: "cliente", text: "Olá! Ainda têm o vestido azul em stock em tamanho M?", delay: 0.3 },
  { from: "bot", text: "Olá Sofia! 👋 Sim, temos em stock. Queres que te envie o link para finalizares a compra?", delay: 1.6, automatic: true },
  { from: "cliente", text: "Sim, por favor!", delay: 2.9 },
  { from: "bot", text: "Aqui está 🛍️ fluxo.pt/loja/vestido-azul — qualquer dúvida, estou por aqui!", delay: 4.1, automatic: true },
];

export function WhatsAppHeroMockup() {
  return (
    <PhoneFrame>
      <div className="flex items-center gap-3 bg-[#075E54] px-4 py-4 pt-8 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
          LV
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Loja Verde Vivo</p>
          <p className="text-[11px] text-white/70">online</p>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
          <Zap className="h-3 w-3" fill="currentColor" strokeWidth={0} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden bg-[#e5ddd5] px-3 py-4 dark:bg-[#0b141a]">
        {MESSAGES.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: message.delay, duration: 0.35, ease: "easeOut" }}
            className={cnFlex(message.from)}
          >
            <div
              className={
                message.from === "cliente"
                  ? "max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[13px] text-neutral-800 shadow-sm"
                  : "max-w-[80%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-[13px] text-neutral-800 shadow-sm"
              }
            >
              {message.automatic && (
                <span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-primary">
                  <Zap className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
                  Resposta automática
                </span>
              )}
              <p>{message.text}</p>
              {message.from === "bot" && (
                <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-neutral-500">
                  {index === MESSAGES.length - 1 ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <CheckCheck className="h-3 w-3 text-sky-500" />
                  )}
                </span>
              )}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 1.0, duration: 0.5, times: [0, 0.6, 1] }}
          className="flex justify-end"
        >
          <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500" />
          </div>
        </motion.div>
      </div>
    </PhoneFrame>
  );
}

function cnFlex(from: string) {
  return from === "cliente" ? "flex justify-start" : "flex justify-end";
}
