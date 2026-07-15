import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CookieConsent } from "@/components/site/cookie-consent";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
