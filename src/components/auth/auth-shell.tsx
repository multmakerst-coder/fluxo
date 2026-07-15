import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      {/* Blur orbs decorativos */}
      <div
        aria-hidden
        className="hero-gradient blur-orb pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full"
      />
      <div
        aria-hidden
        className="dark-section-gradient blur-orb pointer-events-none absolute -right-40 -bottom-40 h-96 w-96 rounded-full opacity-20"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="glass rounded-3xl p-8 sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
              {description ? (
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {children}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao site
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
