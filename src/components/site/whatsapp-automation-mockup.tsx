"use client";

import { motion } from "motion/react";
import { Zap, Clock3 } from "lucide-react";
import { PhoneFrame } from "@/components/site/phone-frame";

// Mockup ilustrativo (não é uma captura de ecrã real do WhatsApp) que mostra uma
// sequência de mensagens automáticas na DM, disparada por uma palavra-chave, com
// indicação visual do intervalo entre cada passo do fluxo.
const STEPS = [
  { text: "quero saber os horários", trigger: true, delay: 0.3 },
  { text: "Olá! 🕐 Estamos abertos de 2ª a sábado, das 9h às 19h.", badge: "Instantâneo", delay: 1.4 },
  { text: "Queres marcar uma visita esta semana?", badge: "+2 minutos", delay: 2.6 },
  { text: "Tens vaga na quinta às 15h? Adorava ir!", trigger: false, isCustomer: true, delay: 3.8 },
];

export function WhatsAppAutomationMockup() {
  return (
    <PhoneFrame>
      <div className="flex items-center gap-3 bg-[#075E54] px-4 py-4 pt-8 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
          EN
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Estúdio Nortada</p>
          <p className="text-[11px] text-white/70">fluxo ativo · gatilho: &ldquo;horários&rdquo;</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden bg-[#e5ddd5] px-3 py-4 dark:bg-[#0b141a]">
        {STEPS.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: step.delay, duration: 0.35, ease: "easeOut" }}
            className={step.isCustomer || step.trigger ? "flex justify-start" : "flex justify-end"}
          >
            <div
              className={
                step.isCustomer || step.trigger
                  ? "max-w-[82%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[13px] text-neutral-800 shadow-sm"
                  : "max-w-[82%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-[13px] text-neutral-800 shadow-sm"
              }
            >
              {step.badge && (
                <span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-primary">
                  <Zap className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
                  Passo automático
                  <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-primary">
                    <Clock3 className="h-2.5 w-2.5" strokeWidth={2} />
                    {step.badge}
                  </span>
                </span>
              )}
              {step.trigger && (
                <span className="mb-1 block text-[10px] font-medium text-warning">Palavra-chave detetada</span>
              )}
              <p>{step.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </PhoneFrame>
  );
}
