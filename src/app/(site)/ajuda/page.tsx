import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HELP_ARTICLES, HELP_CATEGORIES } from "./_data";
import { HelpSearch } from "./help-search";

export const metadata: Metadata = {
  title: "Centro de ajuda",
  description:
    "Encontra respostas sobre como configurar o WhatsApp, Instagram, Email e a tua faturação no Fluxo.",
};

export default function AjudaPage() {
  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-white blur-orb" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Como podemos ajudar?</h1>
          <p className="max-w-xl text-lg text-white/85">
            Pesquisa no centro de ajuda ou explora as categorias abaixo.
          </p>
          <HelpSearch />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_CATEGORIES.map((category) => {
            const articles = HELP_ARTICLES.filter((article) => article.category === category.slug);
            return (
              <Card key={category.slug} className="rounded-2xl border-border">
                <CardContent className="flex flex-col gap-4 px-6 py-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <category.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{category.label}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <ul className="flex flex-col gap-2 border-t border-border pt-4">
                    {articles.map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={`/ajuda/${category.slug}/${article.slug}`}
                          className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <span>{article.title}</span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <h2 className="text-2xl font-bold">Não encontraste o que procuravas?</h2>
          <p className="text-muted-foreground">
            A nossa equipa de suporte responde-te rapidamente por email.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            Fala connosco
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </>
  );
}
