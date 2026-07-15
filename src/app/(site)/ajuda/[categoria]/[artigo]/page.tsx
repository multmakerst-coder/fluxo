import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HELP_ARTICLES, HELP_CATEGORIES } from "../../_data";

export function generateStaticParams() {
  return HELP_ARTICLES.map((article) => ({
    categoria: article.category,
    artigo: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; artigo: string }>;
}): Promise<Metadata> {
  const { categoria, artigo } = await params;
  const article = HELP_ARTICLES.find((item) => item.category === categoria && item.slug === artigo);

  if (!article) {
    return { title: "Artigo não encontrado" };
  }

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ categoria: string; artigo: string }>;
}) {
  const { categoria, artigo } = await params;
  const category = HELP_CATEGORIES.find((item) => item.slug === categoria);
  const article = HELP_ARTICLES.find((item) => item.category === categoria && item.slug === artigo);

  if (!category || !article) {
    notFound();
  }

  const otherArticles = HELP_ARTICLES.filter(
    (item) => item.category === category.slug && item.slug !== article.slug
  );

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Link
        href="/ajuda"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Centro de ajuda
      </Link>

      <p className="mb-2 text-sm font-medium text-primary">{category.label}</p>
      <h1 className="text-3xl font-bold md:text-4xl">{article.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>

      <div className="mt-8 flex flex-col gap-4 border-t border-border pt-8 text-muted-foreground">
        {article.content.split("\n\n").map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {otherArticles.length > 0 && (
        <div className="mt-14 border-t border-border pt-8">
          <h2 className="mb-4 text-lg font-semibold">Mais em {category.label}</h2>
          <ul className="flex flex-col gap-2">
            {otherArticles.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/ajuda/${category.slug}/${item.slug}`}
                  className="flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <span>{item.title}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
