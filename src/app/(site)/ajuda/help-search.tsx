"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { HELP_ARTICLES, HELP_CATEGORIES } from "./_data";

export function HelpSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const normalized = query.trim().toLowerCase();
    return HELP_ARTICLES.filter(
      (article) =>
        article.title.toLowerCase().includes(normalized) ||
        article.excerpt.toLowerCase().includes(normalized) ||
        article.content.toLowerCase().includes(normalized)
    ).slice(0, 6);
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquisa artigos de ajuda…"
          className="h-14 rounded-2xl border-white/30 bg-white/95 pl-12 text-base text-foreground shadow-lg focus-visible:ring-4"
        />
      </div>

      {query.trim() && (
        <Card className="mt-3 rounded-2xl border-0 shadow-xl">
          <CardContent className="flex flex-col gap-1 px-2 py-2">
            {results.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Não encontrámos artigos para &ldquo;{query}&rdquo;.
              </p>
            )}
            {results.map((article) => {
              const category = HELP_CATEGORIES.find((c) => c.slug === article.category);
              return (
                <Link
                  key={article.slug}
                  href={`/ajuda/${article.category}/${article.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{category?.label}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
