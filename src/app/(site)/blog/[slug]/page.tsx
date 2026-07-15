import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { BLOG_POSTS } from "../_data";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function ArticleBody({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\s*\n/);

  return (
    <div className="flex flex-col gap-5 text-muted-foreground">
      {blocks.map((block, index) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={index} className="mt-4 text-2xl font-bold text-foreground">
              {trimmed.replace("## ", "")}
            </h2>
          );
        }

        const lines = trimmed.split("\n");
        const isBulletList = lines.every((line) => line.trim().startsWith("- "));
        const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()));

        if (isBulletList) {
          return (
            <ul key={index} className="ml-5 flex list-disc flex-col gap-2">
              {lines.map((line, i) => (
                <li key={i}>{renderInline(line.trim().replace(/^-\s/, ""))}</li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={index} className="ml-5 flex list-decimal flex-col gap-2">
              {lines.map((line, i) => (
                <li key={i}>{renderInline(line.trim().replace(/^\d+\.\s/, ""))}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index} className="leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) {
    return { title: "Artigo não encontrado" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter(
    (item) => item.category === post.category && item.slug !== post.slug
  ).slice(0, 2);

  return (
    <>
      <section className={cn("relative overflow-hidden bg-gradient-to-br", post.coverGradient)}>
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center md:py-24">
          <Badge className="border border-white/30 bg-white/10 text-white backdrop-blur-sm">
            {post.category}
          </Badge>
          <h1 className="mt-5 text-3xl font-bold text-white md:text-4xl">{post.title}</h1>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" strokeWidth={1.75} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" strokeWidth={1.75} />
              {post.readTime} de leitura
            </span>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Voltar ao blog
        </Link>

        <div className="mb-10 flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initialsFor(post.author)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{post.author}</p>
            <p className="text-xs text-muted-foreground">Equipa Fluxo</p>
          </div>
        </div>

        <ArticleBody content={post.content} />

        {relatedPosts.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h3 className="mb-5 text-xl font-semibold">Continua a ler</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="glass rounded-2xl p-5 transition-colors hover:text-primary"
                >
                  <p className="font-medium">{related.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
