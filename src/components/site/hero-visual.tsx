"use client";

import { motion } from "motion/react";
import { Zap, TrendingUp, Clock } from "lucide-react";
import { WhatsAppHeroMockup } from "@/components/site/whatsapp-hero-mockup";

// Visual principal da hero da homepage: o mockup do telemóvel com motion design,
// rodeado de cartões flutuantes que resumem o valor do produto de forma visual.
export function HeroVisual() {
  return (
    <div className="relative mx-auto flex w-full max-w-md items-center justify-center py-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <WhatsAppHeroMockup />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { delay: 0.8, duration: 0.5 },
          x: { delay: 0.8, duration: 0.5 },
          y: { delay: 1.3, duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
        className="glass absolute -left-4 top-10 hidden items-center gap-2 rounded-2xl px-4 py-3 shadow-lg sm:flex md:-left-10"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Zap className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-semibold text-white">Resposta em 0.3s</p>
          <p className="text-[11px] text-white/70">100% automática</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 1.1, duration: 0.5 },
          x: { delay: 1.1, duration: 0.5 },
          y: { delay: 1.6, duration: 3.4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="glass absolute -right-4 bottom-16 hidden items-center gap-2 rounded-2xl px-4 py-3 shadow-lg sm:flex md:-right-10"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success">
          <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-semibold text-white">+38% conversão</p>
          <p className="text-[11px] text-white/70">em leads qualificados</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{
          opacity: { delay: 1.4, duration: 0.5 },
          y: { delay: 1.9, duration: 3.2, repeat: Infinity, ease: "easeInOut" },
        }}
        className="glass absolute -bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-2xl px-4 py-3 shadow-lg sm:flex"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-info/15 text-info">
          <Clock className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-semibold text-white">Disponível 24/7</p>
          <p className="text-[11px] text-white/70">nunca perdes uma venda</p>
        </div>
      </motion.div>
    </div>
  );
}
