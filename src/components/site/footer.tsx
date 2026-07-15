import Link from "next/link";
import { MessageCircle, Camera, Mail } from "lucide-react";
import { Logo } from "@/components/logo";

const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "/funcionalidades" },
      { label: "Preços", href: "/precos" },
      { label: "Blog", href: "/blog" },
      { label: "Centro de ajuda", href: "/ajuda" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nós", href: "/sobre" },
      { label: "Contacto", href: "/contacto" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de serviço", href: "/termos" },
      { label: "Política de privacidade", href: "/privacidade" },
      { label: "Política de cookies", href: "/cookies" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "WhatsApp", href: "#", icon: MessageCircle },
  { label: "Instagram", href: "#", icon: Camera },
  { label: "Email", href: "mailto:ola@fluxo.pt", icon: Mail },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              A plataforma de automação de WhatsApp, Instagram e Email feita para negócios
              lusófonos.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="glass-subtle flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary"
                >
                  <social.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </Link>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Fluxo. Todos os direitos reservados.</p>
          <p>Feito para o mercado lusófono.</p>
        </div>
      </div>
    </footer>
  );
}
