"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Botão "Continuar com Facebook" que usa o WhatsApp Embedded Signup da Meta:
// o cliente autentica-se e escolhe o número diretamente num popup da Meta, e
// nós recebemos o código de autorização + Phone Number ID/WABA ID por
// postMessage, sem que o cliente precise de ir ao Meta Business Suite copiar
// manualmente nenhum ID ou token. Ver src/app/api/channels/whatsapp/embedded-signup/route.ts
// para a troca do código por um token e o resto do fluxo.

export interface WhatsAppChannelRecord {
  id: string;
  client_id: string;
  type: "whatsapp";
  status: "connected" | "disconnected" | "error";
  display_name: string | null;
  phone_number: string | null;
  external_account_id: string | null;
  access_token_encrypted: string | null;
  metadata: Record<string, unknown>;
}

interface FacebookLoginResponse {
  authResponse?: { code?: string } | null;
  status?: string;
}

declare global {
  interface Window {
    FB?: {
      init: (params: Record<string, unknown>) => void;
      login: (callback: (response: FacebookLoginResponse) => void, params: Record<string, unknown>) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const SDK_SRC = "https://connect.facebook.net/pt_PT/sdk.js";

let sdkLoadPromise: Promise<void> | null = null;

function loadFacebookSdk(appId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.FB) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, xfbml: false, version: "v21.0" });
      resolve();
    };

    if (document.getElementById("facebook-jssdk")) return;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = SDK_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Não foi possível carregar o SDK do Facebook."));
    document.body.appendChild(script);
  });

  return sdkLoadPromise;
}

export function WhatsAppEmbeddedSignupButton({
  onConnected,
}: {
  onConnected: (channel: WhatsAppChannelRecord) => void;
}) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const configId = process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID;
  const [loadingSdk, setLoadingSdk] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const signupDataRef = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

  useEffect(() => {
    if (!appId) return;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type !== "WA_EMBEDDED_SIGNUP") return;
        if (data.event === "FINISH" || data.event === "FINISH_ONLY_WABA_ID") {
          signupDataRef.current = {
            wabaId: data.data?.waba_id,
            phoneNumberId: data.data?.phone_number_id,
          };
        }
      } catch {
        // mensagem não relacionada com o embedded signup — ignorar
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [appId]);

  if (!appId || !configId) {
    // Sem app Meta configurada neste ambiente — a UI que usa este botão deve
    // manter sempre a ligação manual disponível como alternativa.
    return null;
  }

  async function finishSignup(code: string) {
    setConnecting(true);
    try {
      const response = await fetch("/api/channels/whatsapp/embedded-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          wabaId: signupDataRef.current.wabaId,
          phoneNumberId: signupDataRef.current.phoneNumberId,
        }),
      });
      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody?.error ?? "Erro ao ligar WhatsApp");
      }
      onConnected(responseBody.channel as WhatsAppChannelRecord);
    } catch (error) {
      toast.error("Não foi possível concluir a ligação com o Facebook", {
        description: error instanceof Error ? error.message : "Tenta novamente.",
      });
    } finally {
      setConnecting(false);
      signupDataRef.current = {};
    }
  }

  async function handleClick() {
    setLoadingSdk(true);
    try {
      await loadFacebookSdk(appId as string);
    } catch {
      toast.error("Não foi possível carregar a ligação com o Facebook. Tenta novamente.");
      setLoadingSdk(false);
      return;
    }
    setLoadingSdk(false);

    window.FB?.login(
      (response) => {
        const code = response.authResponse?.code;
        if (!code) {
          if (response.status && response.status !== "unknown") {
            toast.error("Ligação com o Facebook cancelada ou falhou.");
          }
          return;
        }
        void finishSignup(code);
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
      },
    );
  }

  const busy = loadingSdk || connecting;

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="w-fit gap-2 bg-[#1877F2] text-white hover:bg-[#1568d8]"
    >
      {busy ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
        </svg>
      )}
      Continuar com Facebook
    </Button>
  );
}
