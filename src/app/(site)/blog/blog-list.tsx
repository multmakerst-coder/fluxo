"use client";

import { Newspaper } from "lucide-react";
import { BLOG_POSTS } from "./_data";

export function BlogList() {
  if (BLOG_POSTS.length === 0) {
    return (
      <div className="glass mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl px-8 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Newspaper className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <h2 className="text-xl font-semibold">Ainda não há artigos publicados</h2>
        <p className="text-muted-foreground">
          Estamos a preparar conteúdo novo sobre automação de WhatsApp, Instagram e Email. Volta em breve.
        </p>
      </div>
    );
  }

  return null;
}
