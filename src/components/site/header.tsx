"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Iniciar", href: "/" },
  { label: "Funcionalidades", href: "/funcionalidades" },
  { label: "Preços", href: "/precos" },
  { label: "Blog", href: "/blog" },
  { label: "Ajuda", href: "/ajuda" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-subtle sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <LanguageToggle />
          <Button nativeButton={false} variant="outline" size="sm" render={<Link href="/entrar">Entrar</Link>} />
          <Button nativeButton={false} size="sm" render={<Link href="/registar">Começar grátis</Link>} />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" strokeWidth={1.75} />
                </Button>
              }
            />
            <SheetContent side="right" className="glass w-full sm:max-w-sm">
              <SheetHeader className="flex flex-row items-center justify-between">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
                <SheetClose
                  render={
                    <Button variant="ghost" size="icon" aria-label="Fechar menu">
                      <X className="h-5 w-5" strokeWidth={1.75} />
                    </Button>
                  }
                />
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      pathname === link.href && "bg-muted text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Idioma</span>
                  <LanguageToggle />
                </div>
                <Button nativeButton={false}
                  variant="outline"
                  onClick={() => setOpen(false)}
                  render={<Link href="/entrar">Entrar</Link>}
                />
                <Button nativeButton={false} onClick={() => setOpen(false)} render={<Link href="/registar">Começar grátis</Link>} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
