import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  Camera,
  Mail,
  Reply,
  Radio,
  Workflow,
  ListChecks,
  MessageSquareReply,
  AtSign,
  Inbox,
  Repeat,
  Newspaper,
  Clock,
  Users,
  ChartColumn,
  MessagesSquare,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Funcionalidades",
  description:
    "Descobre todas as funcionalidades do Fluxo para automatizar WhatsApp, Instagram e Email, com CRM, analytics e live chat incluídos.",
};

const WHATSAPP_FEATURES = [
  {
    icon: Reply,
    title: "Respostas automáticas",
    description:
      "Configura respostas instantâneas para perguntas frequentes, horários de funcionamento e menus de atendimento.",
  },
  {
    icon: Radio,
    title: "Broadcasts",
    description:
      "Envia mensagens em massa segmentadas por etiquetas, comportamento ou histórico de compra, dentro das regras da API oficial.",
  },
  {
    icon: Workflow,
    title: "Fluxos de conversa",
    description:
      "Cria árvores de decisão visuais que guiam o cliente desde o primeiro contacto até à conversão.",
  },
  {
    icon: ListChecks,
    title: "Qualificação de leads",
    description:
      "Faz perguntas automáticas para classificar leads por intenção e orçamento antes de os passares à equipa comercial.",
  },
];

const INSTAGRAM_FEATURES = [
  {
    icon: MessageSquareReply,
    title: "Comentário → DM",
    description:
      "Transforma automaticamente comentários em publicações numa mensagem direta personalizada, sem perder oportunidades.",
  },
  {
    icon: AtSign,
    title: "Menções em stories",
    description:
      "Deteta menções nas stories dos teus seguidores e responde de forma automática para amplificar o alcance.",
  },
  {
    icon: Inbox,
    title: "Gestão de DMs",
    description:
      "Centraliza todas as mensagens diretas numa única caixa de entrada partilhada com a tua equipa.",
  },
];

const EMAIL_FEATURES = [
  {
    icon: Repeat,
    title: "Sequências",
    description:
      "Cria séries de emails automáticos acionados por comportamento, como boas-vindas, onboarding ou reengajamento.",
  },
  {
    icon: Newspaper,
    title: "Newsletters",
    description:
      "Desenha e agenda newsletters com editor visual, sem depender de outra ferramenta externa.",
  },
  {
    icon: Clock,
    title: "Follow-ups automáticos",
    description:
      "Garante que nenhum lead fica sem resposta com lembretes automáticos após X dias de silêncio.",
  },
];

const PLATFORM_FEATURES = [
  {
    icon: Users,
    title: "CRM integrado",
    description:
      "Todos os contactos, etiquetas, notas e histórico de conversas organizados num único painel, sem folhas de cálculo.",
  },
  {
    icon: ChartColumn,
    title: "Analytics",
    description:
      "Métricas de resposta, conversão e desempenho por fluxo, canal e campanha, atualizadas em tempo real.",
  },
  {
    icon: MessagesSquare,
    title: "Live chat",
    description:
      "A tua equipa pode assumir qualquer conversa a qualquer momento, com contexto completo do histórico do cliente.",
  },
];

function FeatureGrid({
  features,
}: {
  features: { icon: LucideIcon; title: string; description: string }[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {features.map((feature) => (
        <Card key={feature.title} className="rounded-2xl border-border">
          <CardContent className="flex flex-col gap-3 px-6 py-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <feature.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function FuncionalidadesPage() {
  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white blur-orb" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Funcionalidades pensadas para vender mais, com menos esforço
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
            Automatiza cada canal de conversa com o teu cliente e mantém tudo organizado
            num só painel.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Automação por canal</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cada canal tem as suas próprias regras — o Fluxo adapta-se a todas elas.
          </p>
        </div>

        <Tabs defaultValue="whatsapp" className="items-center">
          <TabsList className="h-auto flex-wrap gap-1 bg-muted p-1.5">
            <TabsTrigger value="whatsapp" className="gap-2 px-4 py-2">
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="instagram" className="gap-2 px-4 py-2">
              <Camera className="h-4 w-4" strokeWidth={1.75} />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2 px-4 py-2">
              <Mail className="h-4 w-4" strokeWidth={1.75} />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp" className="mt-10 w-full">
            <FeatureGrid features={WHATSAPP_FEATURES} />
          </TabsContent>
          <TabsContent value="instagram" className="mt-10 w-full">
            <FeatureGrid features={INSTAGRAM_FEATURES} />
          </TabsContent>
          <TabsContent value="email" className="mt-10 w-full">
            <FeatureGrid features={EMAIL_FEATURES} />
          </TabsContent>
        </Tabs>
      </section>

      <section id="plataforma" className="dark-section-gradient relative overflow-hidden py-20 md:py-28">
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary blur-orb" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Uma plataforma, todos os dados</h2>
            <p className="mt-4 text-lg text-white/70">
              CRM, analytics e live chat trabalham juntos para dares o melhor atendimento possível.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PLATFORM_FEATURES.map((feature) => (
              <div key={feature.title} className="glass rounded-3xl p-8">
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-brand-accent text-white">
                  <feature.icon className="h-7 w-7" strokeWidth={1.75} />
                </span>
                <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center md:py-28">
        <h2 className="text-3xl font-bold md:text-4xl">Vê estas funcionalidades em ação</h2>
        <p className="max-w-xl text-lg text-muted-foreground">
          Cria a tua conta gratuita e experimenta os fluxos de automação em minutos.
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
