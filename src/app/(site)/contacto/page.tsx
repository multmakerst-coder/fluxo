import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Fala com a equipa do Fluxo para dúvidas de vendas, suporte técnico ou parcerias.",
};

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Email de suporte",
    description: "A forma mais rápida de falar connosco.",
    action: "suporte@fluxo.pt",
    href: "mailto:suporte@fluxo.pt",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp comercial",
    description: "Fala com a equipa de vendas em tempo real.",
    action: "Iniciar conversa",
    href: "#",
  },
  {
    icon: Users,
    title: "Comunidade Fluxo",
    description: "Troca experiências com outros utilizadores da plataforma.",
    action: "Entrar na comunidade",
    href: "#",
  },
];

export default function ContactoPage() {
  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white blur-orb" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Fala connosco</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
            Tens dúvidas sobre o Fluxo? A nossa equipa responde-te rapidamente.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
          <Card className="glass rounded-3xl border-0">
            <CardContent className="px-6 py-8 sm:px-8 sm:py-10">
              <h2 className="mb-6 text-xl font-semibold">Envia-nos uma mensagem</h2>
              <ContactForm />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            {CONTACT_CHANNELS.map((channel) => (
              <Card key={channel.title} className="rounded-2xl border-border">
                <CardContent className="flex items-start gap-4 px-6 py-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <channel.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-semibold">{channel.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{channel.description}</p>
                    <Link
                      href={channel.href}
                      className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      {channel.action}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
