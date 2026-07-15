import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PLANS } from "@/lib/plans";
import { PricingCards } from "./pricing-cards";

export const metadata: Metadata = {
  title: "Preços",
  description:
    "Compara os planos Gratuito, Pro e Empresas do Fluxo e escolhe o que melhor se adapta ao teu negócio.",
};

const COMPARISON_ROWS = [
  { label: "Contactos", values: ["500", "Ilimitados", "Ilimitados"] },
  { label: "Canais incluídos", values: ["1 canal", "WhatsApp + Instagram + Email", "Todos + API"] },
  { label: "Fluxos ativos", values: ["3", "Ilimitados", "Ilimitados"] },
  { label: "Broadcasts", values: [false, true, true] },
  { label: "Respostas com IA", values: [false, true, true] },
  { label: "Analytics completo", values: [false, true, true] },
  { label: "Multi-utilizador (equipa)", values: [false, false, true] },
  { label: "API própria", values: [false, false, true] },
  { label: "Suporte prioritário", values: [false, true, true] },
  { label: "Onboarding dedicado", values: [false, false, true] },
];

const PRICING_FAQ = [
  {
    question: "Como funciona a faturação anual?",
    answer:
      "Ao escolheres o plano anual, pagas o equivalente a 10 meses e ganhas 2 meses grátis, faturados numa única cobrança anual.",
  },
  {
    question: "Posso mudar de plano depois de subscrever?",
    answer:
      "Sim. Podes fazer upgrade ou downgrade a qualquer momento a partir do teu painel. As alterações são aplicadas de forma proporcional.",
  },
  {
    question: "O que acontece se ultrapassar o limite de contactos do plano Gratuito?",
    answer:
      "Vais receber um aviso no painel para fazeres upgrade para o plano Pro, que tem contactos ilimitados. Os teus dados nunca são apagados.",
  },
  {
    question: "Existem custos escondidos ou taxas de configuração?",
    answer:
      "Não. O preço apresentado é o preço final. Custos de mensagens da API oficial do WhatsApp podem aplicar-se de acordo com as tarifas da Meta.",
  },
  {
    question: "O plano Empresas tem um preço fixo?",
    answer:
      "O plano Empresas é personalizado consoante o número de utilizadores, volume de contactos e necessidades de integração. Fala com a nossa equipa para uma proposta à medida.",
  },
];

export default function PrecosPage() {
  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white blur-orb" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Planos simples, sem surpresas
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
            Escolhe o plano ideal para o teu negócio e começa a automatizar hoje mesmo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <PricingCards />
      </section>

      <section className="bg-muted/40 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Compara todas as funcionalidades</h2>
          </div>
          <div className="glass overflow-hidden rounded-3xl">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-1/3 text-sm">Funcionalidade</TableHead>
                  {PLANS.map((plan) => (
                    <TableHead key={plan.slug} className="text-center text-sm">
                      {plan.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="whitespace-normal font-medium">{row.label}</TableCell>
                    {row.values.map((value, index) => (
                      <TableCell key={`${row.label}-${index}`} className="text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="mx-auto h-4 w-4 text-primary" strokeWidth={2} />
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" strokeWidth={2} />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{value}</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Perguntas frequentes sobre preços</h2>
        </div>
        <Accordion className="glass rounded-3xl px-6">
          {PRICING_FAQ.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="py-5 text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
