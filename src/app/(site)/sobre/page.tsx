import type { Metadata } from "next";
import Link from "next/link";
import { Target, Heart, Globe, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conhece a história e a missão do Fluxo: tornar a automação de conversas acessível para negócios lusófonos.",
};

const VALUES = [
  {
    icon: Target,
    title: "Simplicidade",
    description: "Automação poderosa não precisa de ser complicada — construímos para qualquer pessoa usar.",
  },
  {
    icon: Heart,
    title: "Proximidade",
    description: "Suporte em português, com gente que entende os desafios de vender em Portugal e no Brasil.",
  },
  {
    icon: Globe,
    title: "Acessibilidade",
    description: "Preços justos para que negócios de qualquer dimensão possam automatizar as suas conversas.",
  },
  {
    icon: Rocket,
    title: "Evolução constante",
    description: "Lançamos funcionalidades novas todas as semanas, ouvindo sempre quem usa a plataforma.",
  },
];

const TEAM = [
  { name: "Rui Nogueira", role: "Co-fundador & CEO", initials: "RN" },
  { name: "Sofia Martins", role: "Co-fundadora & CTO", initials: "SM" },
  { name: "André Pinto", role: "Head de Produto", initials: "AP" },
  { name: "Carolina Reis", role: "Head de Sucesso do Cliente", initials: "CR" },
];

export default function SobrePage() {
  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute -top-20 -right-24 h-96 w-96 rounded-full bg-white blur-orb" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Automação acessível para o mercado lusófono
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
            Nascemos para resolver um problema simples: negócios em português perdiam vendas
            por não conseguirem responder a tempo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold">A nossa história</h2>
            <div className="mt-5 flex flex-col gap-4 text-muted-foreground">
              <p>
                O Fluxo nasceu em 2023, depois de os nossos fundadores gerirem um pequeno negócio
                online e perceberem que a maior parte das vendas perdidas não era por falta de
                interesse dos clientes — era por demora nas respostas.
              </p>
              <p>
                Testámos dezenas de ferramentas de automação disponíveis no mercado e nenhuma
                estava verdadeiramente pensada para negócios lusófonos: faltava suporte em
                português, faltavam preços justos e faltava simplicidade.
              </p>
              <p>
                Decidimos construir a solução que gostaríamos de ter tido. Hoje, o Fluxo ajuda
                centenas de negócios em Portugal e no Brasil a responder, qualificar e vender
                através do WhatsApp, Instagram e Email — no piloto automático.
              </p>
            </div>
          </div>
          <Card className="glass rounded-3xl border-0">
            <CardContent className="flex flex-col gap-4 px-8 py-10">
              <h3 className="font-heading text-xl font-semibold">A nossa missão</h3>
              <p className="text-muted-foreground">
                Tornar a automação de conversas simples e acessível para qualquer negócio
                lusófono, para que ninguém perca uma venda por falta de tempo para responder.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="dark-section-gradient relative overflow-hidden py-20 md:py-28">
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-primary blur-orb" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">O que nos guia</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div key={value.title} className="glass rounded-3xl p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-brand-accent text-white">
                  <value.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mb-2 text-lg font-semibold text-white">{value.title}</h3>
                <p className="text-sm text-white/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">A equipa por trás do Fluxo</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Um grupo pequeno, focado em construir a melhor ferramenta de automação para quem fala português.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member) => (
            <Card key={member.name} className="rounded-2xl border-border text-center">
              <CardContent className="flex flex-col items-center gap-3 px-6 py-8">
                <Avatar className="size-16">
                  <AvatarFallback className="text-lg">{member.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center md:py-28">
        <h2 className="text-3xl font-bold md:text-4xl">Queres fazer parte desta história?</h2>
        <p className="max-w-xl text-lg text-muted-foreground">
          Experimenta o Fluxo gratuitamente e vê como podes automatizar as tuas conversas.
        </p>
        <Button nativeButton={false}
          size="lg"
          className="h-12 gap-2 rounded-xl px-8 text-base"
          render={
            <Link href="/registar">
              Começar grátis
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          }
        />
      </section>
    </>
  );
}
