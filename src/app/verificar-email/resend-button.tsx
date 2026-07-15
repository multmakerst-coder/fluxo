"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CircleAlert, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "fluxo:pending-verification-email";
const RESEND_COOLDOWN_SECONDS = 30;

// Não há nada a subscrever — só precisamos de ler o localStorage após a hidratação,
// para evitar um mismatch entre o servidor (que não conhece o valor) e o cliente.
function subscribeNoop() {
  return () => {};
}

function getStoredEmail() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ResendVerificationEmail({ email: emailFromParams }: { email?: string }) {
  const storedEmail = useSyncExternalStore(subscribeNoop, getStoredEmail, () => null);
  const email = emailFromParams ?? storedEmail;
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emailFromParams) {
      window.localStorage.setItem(STORAGE_KEY, emailFromParams);
    }
  }, [emailFromParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!email) {
      setError("Não encontrámos o teu email. Volta a registar-te.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({ type: "signup", email });

      if (resendError) {
        setError(resendError.message);
        toast.error(resendError.message);
      } else {
        toast.success("Email de verificação reenviado.");
        setCooldown(RESEND_COOLDOWN_SECONDS);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocorreu um erro inesperado. Tenta novamente.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Mail className="h-6 w-6" />
      </div>

      {email ? (
        <p className="text-center text-sm text-muted-foreground">
          Enviámos um link de confirmação para{" "}
          <span className="font-medium text-foreground">{email}</span>. Abre o email e clica no
          link para ativares a tua conta.
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Enviámos um link de confirmação para o email que usaste no registo. Abre o email e
          clica no link para ativares a tua conta.
        </p>
      )}

      {error ? (
        <Alert variant="destructive" className="w-full">
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full rounded-xl"
        onClick={handleResend}
        disabled={isSending || cooldown > 0}
      >
        <RefreshCw className="h-4 w-4" />
        {cooldown > 0 ? `Reenviar email (${cooldown}s)` : "Reenviar email"}
      </Button>
    </div>
  );
}
