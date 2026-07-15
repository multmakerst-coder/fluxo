import Link from "next/link";
import {
  MessageCircle,
  Camera,
  Mail,
  Workflow,
  Sparkles,
  Radio,
  Users,
  ChartColumn,
  MessagesSquare,
  ArrowRight,
  Check,
  Link2,
  Wand,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PLANS } from "@/lib/plans";
import { HeroVisual } from "@/components/site/hero-visual";
import { InstagramCommentsMockup } from "@/components/site/instagram-comments-mockup";
import { WhatsAppAutomationMockup } from "@/components/site/whatsapp-automation-mockup";

const STEPS = [
  {
    icon: Link2,
    title: "Liga os teus canais",
    description:
      "Conecta o WhatsApp Business, Instagram e Email em poucos minutos, sem precisar de programar.",
  },
  {
    icon: Wand,
    title: "Cria fluxos automáticos",
    description:
      "Usa o editor visual para desenhar respostas automáticas, sequências e qualificação de leads.",
  },
  {
    icon: Rocket,
    title: "Cresce no piloto automático",
    description:
      "O Fluxo responde, qualifica e converte contactos 24 horas por dia, mesmo enquanto dormes.",
  },
];

const CHANNELS = [
  {
    icon: MessageCircle,
    name: "WhatsApp",
    description:
      "Respostas automáticas, broadcasts e fluxos de conversa para o canal mais usado em Portugal e no Brasil.",
  },
  {
    icon: Camera,
    name: "Instagram",
    description:
      "Transforma comentários em DMs, responde a menções em stories e automatiza a tua caixa de entrada.",
  },
  {
    icon: Mail,
    name: "Email",
    description:
      "Sequências, newsletters e follow-ups automáticos para nutrir leads e fechar mais vendas.",
  },
];

const FEATURES = [
  {
    icon: Workflow,
    title: "Fluxos visuais",
    description: "Desenha automações complexas arrastando blocos, sem escrever uma linha de código.",
  },
  {
    icon: Sparkles,
    title: "Respostas com IA",
    description: "Deixa a inteligência artificial responder a perguntas frequentes com o tom da tua marca.",
  },
  {
    icon: Radio,
    title: "Broadcasts",
    description: "Envia campanhas segmentadas para milhares de contactos com um único clique.",
  },
  {
    icon: Users,
    title: "CRM integrado",
    description: "Organiza contactos, etiquetas e histórico de conversas num único lugar.",
  },
  {
    icon: ChartColumn,
    title: "Analytics completo",
    description: "Acompanha taxas de resposta, conversão e desempenho de cada fluxo em tempo real.",
  },
  {
    icon: MessagesSquare,
    title: "Live chat",
    description: "A tua equipa assume a conversa a qualquer momento, sem perder o contexto.",
  },
];

const TESTIMONIALS = [
  {
    name: "Mariana Costa",
    role: "Fundadora, Loja Verde Vivo",
    initials: "MC",
    // Avatar ilustrativo/fictício (DiceBear) — não corresponde a uma pessoa real.
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Mariana-Costa-Fluxo&backgroundColor=b6e3f4",
    quote:
      "Desde que ligámos o WhatsApp ao Fluxo, deixámos de perder encomendas por falta de resposta. As automações pagam-se a elas próprias.",
  },
  {
    name: "Tiago Ferreira",
    role: "Diretor de Marketing, ClínicaMais",
    initials: "TF",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Tiago-Ferreira-Fluxo&backgroundColor=ffd5dc",
    quote:
      "O Instagram era um caos de DMs por responder. Com os fluxos do Fluxo, qualificamos leads automaticamente antes de chegarem à equipa comercial.",
  },
  {
    name: "Beatriz Almeida",
    role: "CEO, Estúdio Nortada",
    initials: "BA",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Beatriz-Almeida-Fluxo&backgroundColor=d1d4f9",
    quote:
      "A combinação de WhatsApp, Instagram e Email numa só plataforma poupou-nos horas por semana. O suporte em português também faz toda a diferença.",
  },
];

const FAQ_HOME = [
  {
    question: "Preciso de saber programar para usar o Fluxo?",
    answer:
      "Não. O editor de fluxos é totalmente visual — basta arrastar e ligar blocos para criar automações completas, sem escrever código.",
  },
  {
    question: "O Fluxo funciona com o WhatsApp Business normal?",
    answer:
      "Sim. Ligamos diretamente à API oficial do WhatsApp Business, garantindo que a tua conta fica segura e verificada.",
  },
  {
    question: "Posso experimentar antes de pagar?",
    answer:
      "Sim. O plano Gratuito não tem custos nem exige cartão de crédito e inclui até 500 contactos e 3 fluxos ativos.",
  },
  {
    question: "Consigo mudar de plano a qualquer momento?",
    answer:
      "Sim. Podes mudar de plano ou cancelar a qualquer altura diretamente a partir do teu painel, sem burocracia.",
  },
  {
    question: "Que suporte está incluído?",
    answer:
      "Todos os planos têm acesso ao centro de ajuda e suporte por email. Os planos Pro e Empresas têm ainda suporte prioritário.",
  },
];

function formatPrice(value: number | null) {
  if (value === null) return "Sob consulta";
  if (value === 0) return "Grátis";
  return `${value}€`;
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white blur-orb" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#4f2fd4] blur-orb" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
          <div className="flex flex-col items-center gap-8 text-center md:items-start md:text-left">
            <Badge className="border border-white/30 bg-white/10 text-white backdrop-blur-sm">
              Feito para o mercado lusófono
            </Badge>
            <h1 className="max-w-xl text-4xl font-bold text-white md:text-6xl">
              Automatiza o WhatsApp, Instagram e Email sem perder o toque humano
            </h1>
            <p className="max-w-xl text-lg text-white/85 md:text-xl">
              O Fluxo liga os teus canais de conversa, responde a clientes 24 horas por dia e
              transforma mensagens em vendas — tudo num painel simples, em português.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button nativeButton={false}
                size="lg"
                className="h-12 rounded-xl bg-white px-8 text-base text-primary hover:bg-white/90"
                render={<Link href="/registar">Começar grátis</Link>}
              />
              <Button nativeButton={false}
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/40 bg-transparent px-8 text-base text-white hover:bg-white/10"
                render={<Link href="/funcionalidades">Ver funcionalidades</Link>}
              />
            </div>
            <p className="text-sm text-white/70">Sem cartão de crédito. Cancela quando quiseres.</p>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Como funciona</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Três passos simples para pores a tua automação a trabalhar.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card key={step.title} className="glass rounded-3xl border-0 p-2">
              <CardContent className="flex flex-col gap-4 px-6 py-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <span className="font-heading text-3xl font-bold text-primary/20">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Canais */}
      <section className="dark-section-gradient relative overflow-hidden py-20 md:py-28">
        <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-primary blur-orb" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Todos os teus canais, num só lugar</h2>
            <p className="mt-4 text-lg text-white/70">
              Centraliza as conversas dos teus clientes e responde a partir de uma única caixa de entrada.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {CHANNELS.map((channel) => (
              <div key={channel.name} className="glass rounded-3xl p-8">
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-brand-accent text-white">
                  <channel.icon className="h-7 w-7" strokeWidth={1.75} />
                </span>
                <h3 className="mb-2 text-xl font-semibold text-white">{channel.name}</h3>
                <p className="text-white/70">{channel.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automação em ação */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">A automação em ação</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Exemplos ilustrativos de como o Fluxo transforma comentários e mensagens em conversas
            automáticas — sem que ninguém da tua equipa precise de tocar no telemóvel.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2 md:gap-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <InstagramCommentsMockup />
            <div>
              <h3 className="text-lg font-semibold">Comentários e DMs do Instagram</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Responde a comentários publicamente e envia uma DM automática de seguimento, sem
                perder nenhuma oportunidade.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 text-center">
            <WhatsAppAutomationMockup />
            <div>
              <h3 className="text-lg font-semibold">Sequências automáticas no WhatsApp</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Uma palavra-chave dispara uma conversa guiada, com o tempo entre passos que tu
                definires no editor visual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Tudo o que precisas para automatizar</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ferramentas pensadas para negócios que querem crescer sem contratar mais equipa.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="rounded-2xl border-border">
              <CardContent className="flex flex-col gap-3 px-6 py-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="bg-muted/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Quem usa, recomenda</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Negócios de todos os tamanhos já poupam tempo e vendem mais com o Fluxo.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.name} className="glass rounded-3xl border-0">
                <CardContent className="flex flex-col gap-5 px-6 py-6">
                  <p className="text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preços resumido */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Planos para cada fase do teu negócio</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Começa grátis e evolui à medida que a tua automação cresce.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.slug}
              className={
                plan.highlighted
                  ? "glass relative rounded-3xl border-0 ring-2 ring-primary"
                  : "rounded-3xl border-border"
              }
            >
              <CardContent className="flex flex-col gap-5 px-6 py-8">
                {plan.highlighted && (
                  <Badge className="w-fit">Mais popular</Badge>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold">
                    {formatPrice(plan.priceMonthly)}
                  </span>
                  {!plan.isCustomPrice && plan.priceMonthly !== 0 && (
                    <span className="text-sm text-muted-foreground">/mês</span>
                  )}
                </div>
                <ul className="flex flex-col gap-2">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button nativeButton={false}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-2"
                  render={<Link href="/precos">Ver detalhes</Link>}
                />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/precos" className="text-sm font-medium text-primary hover:underline">
            Comparar todos os planos e funcionalidades →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/40 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Perguntas frequentes</h2>
          </div>
          <Accordion className="glass rounded-3xl px-6">
            {FAQ_HOME.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="py-5 text-base">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA final */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-white blur-orb" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center md:py-28">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Pronto para automatizar as tuas conversas?
          </h2>
          <p className="max-w-xl text-lg text-white/85">
            Junta-te a centenas de negócios lusófonos que já vendem mais com menos esforço.
          </p>
          <Button nativeButton={false}
            size="lg"
            className="h-12 gap-2 rounded-xl bg-white px-8 text-base text-primary hover:bg-white/90"
            render={
              <Link href="/registar">
                Começar grátis
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            }
          />
        </div>
      </section>
    </>
  );
}
