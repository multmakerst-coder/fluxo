"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "fluxo-cookie-consent";

// Não há nada a subscrever — só precisamos de ler o localStorage após a hidratação,
// para evitar um mismatch entre o servidor (que não conhece o valor) e o cliente.
function subscribeNoop() {
  return () => {};
}

function hasStoredConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY) !== null;
  } catch {
    // localStorage indisponível (ex.: modo privado) — não mostra o banner.
    return true;
  }
}

export function CookieConsent() {
  const [dismissed, setDismissed] = useState(false);
  const alreadyConsented = useSyncExternalStore(subscribeNoop, hasStoredConsent, () => true);

  function respond(value: "aceitar" | "rejeitar") {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignora se localStorage não estiver disponível
    }
    setDismissed(true);
  }

  if (alreadyConsented || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="glass mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cookie className="h-4.5 w-4.5" />
          </span>
          <p className="text-sm text-muted-foreground">
            Usamos cookies para melhorar a tua experiência e analisar o tráfego do site. Consulta a nossa{" "}
            <Link href="/cookies" className="font-medium text-foreground underline underline-offset-2">
              política de cookies
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={() => respond("rejeitar")}>
            Rejeitar
          </Button>
          <Button size="sm" onClick={() => respond("aceitar")}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
