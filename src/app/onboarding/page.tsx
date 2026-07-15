"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MessageCircle,
  Camera,
  Mail,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS, ONBOARDING_TEMPLATES, type OnboardingStepId } from "./_data";

type ConnectionState = "desligado" | "a-ligar" | "ligado";

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [whatsapp, setWhatsapp] = useState<ConnectionState>("desligado");
  const [instagram, setInstagram] = useState<ConnectionState>("desligado");
  const [email, setEmail] = useState<ConnectionState>("desligado");
  const [emailDomain, setEmailDomain] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);

  const step = ONBOARDING_STEPS[stepIndex];
  const progresso = Math.round(((stepIndex + 1) / ONBOARDING_STEPS.length) * 100);

  function podeAvancar(id: OnboardingStepId) {
    if (id === "whatsapp") return whatsapp === "ligado";
    if (id === "fluxo") return templateId !== null;
    return true;
  }

  function avancar() {
    if (stepIndex === ONBOARDING_STEPS.length - 1) {
      concluir();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
  }

  function recuar() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function simularLigacao(setter: (s: ConnectionState) => void, nome: string) {
    setter("a-ligar");
    setTimeout(() => {
      setter("ligado");
      toast.success(`${nome} ligado com sucesso.`);
    }, 900);
  }

  function concluir() {
    const template = ONBOARDING_TEMPLATES.find((t) => t.id === templateId);
    toast.success("Configuração inicial concluída!", {
      description: "O teu primeiro fluxo está pronto a ser editado.",
    });
    if (template) {
      router.push(`/dashboard/fluxos/${template.canal}/onboarding-${Date.now()}`);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Passo {stepIndex + 1} de {ONBOARDING_STEPS.length}
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Sair e continuar mais tarde
          </button>
        </div>
        <Progress value={progresso} />
        <div className="flex flex-wrap gap-2">
          {ONBOARDING_STEPS.map((s, i) => (
            <Badge
              key={s.id}
              variant="outline"
              className={cn(
                "border-0",
                i === stepIndex
                  ? "bg-primary/10 text-primary"
                  : i < stepIndex
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < stepIndex && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {s.titulo}
              {s.opcional ? " (opcional)" : ""}
            </Badge>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-8 sm:p-10">
        {step.id === "whatsapp" && (
          <ConnectStep
            icon={MessageCircle}
            titulo="Liga o teu WhatsApp Business"
            descricao="Autoriza o Fluxo a enviar e receber mensagens em teu nome através da Meta WhatsApp Cloud API."
            passos={[
              "Cria ou usa uma conta Meta Business existente.",
              "Verifica o número de telefone que vais usar para o WhatsApp Business.",
              "Autoriza o Fluxo a aceder à tua conta WhatsApp Business.",
            ]}
            estado={whatsapp}
            onLigar={() => simularLigacao(setWhatsapp, "WhatsApp")}
            labelBotao="Ligar WhatsApp Business"
          />
        )}

        {step.id === "instagram" && (
          <ConnectStep
            icon={Camera}
            titulo="Liga a tua conta de Instagram"
            descricao="Opcional — podes ligar mais tarde em Configurações → Canais. Precisas de uma conta Instagram Business ou Creator."
            passos={[
              "Confirma que a tua conta Instagram é Business ou Creator.",
              "Liga-a a uma Página do Facebook.",
              "Autoriza o Fluxo a ler e responder a mensagens diretas.",
            ]}
            estado={instagram}
            onLigar={() => simularLigacao(setInstagram, "Instagram")}
            labelBotao="Ligar Instagram"
            opcional
          />
        )}

        {step.id === "email" && (
          <div className="flex flex-col gap-5">
            <StepHeader
              icon={Mail}
              titulo="Configura o teu email de envio"
              descricao="Opcional — usa um domínio próprio para que os teus emails cheguem com boa reputação de entrega."
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dominio-email">Domínio de envio</Label>
              <Input
                id="dominio-email"
                placeholder="envio.a-tua-empresa.pt"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                disabled={email === "ligado"}
              />
            </div>
            {email === "ligado" ? (
              <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                Domínio verificado e pronto a usar.
              </div>
            ) : (
              <Button
                onClick={() => simularLigacao(setEmail, "Email")}
                disabled={!emailDomain.trim() || email === "a-ligar"}
                className="w-fit"
              >
                {email === "a-ligar" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Verificar domínio
              </Button>
            )}
          </div>
        )}

        {step.id === "fluxo" && (
          <div className="flex flex-col gap-5">
            <StepHeader
              icon={Sparkles}
              titulo="Cria o teu primeiro fluxo"
              descricao="Escolhe um template para começar — podes editar tudo depois no construtor de fluxos."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ONBOARDING_TEMPLATES.map((template) => {
                const Icon = template.canal === "whatsapp" ? MessageCircle : template.canal === "instagram" ? Camera : Mail;
                const selecionado = templateId === template.id;
                return (
                  <Card
                    key={template.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setTemplateId(template.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setTemplateId(template.id);
                    }}
                    className={cn(
                      "cursor-pointer border-0 ring-1 ring-border transition-colors",
                      selecionado && "ring-2 ring-primary",
                    )}
                  >
                    <CardContent className="flex flex-col gap-2 px-4">
                      <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        {selecionado && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm font-medium">{template.nome}</p>
                      <p className="text-xs text-muted-foreground">{template.descricao}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={recuar} disabled={stepIndex === 0}>
          <ArrowLeft /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          {step.opcional && step.id !== "fluxo" && (
            <Button variant="ghost" onClick={avancar}>
              Saltar por agora
            </Button>
          )}
          <Button onClick={avancar} disabled={!podeAvancar(step.id)}>
            {stepIndex === ONBOARDING_STEPS.length - 1 ? "Concluir configuração" : "Seguinte"}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  icon: Icon,
  titulo,
  descricao,
}: {
  icon: typeof MessageCircle;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h1 className="font-heading text-xl font-semibold">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
      </div>
    </div>
  );
}

function ConnectStep({
  icon,
  titulo,
  descricao,
  passos,
  estado,
  onLigar,
  labelBotao,
  opcional,
}: {
  icon: typeof MessageCircle;
  titulo: string;
  descricao: string;
  passos: string[];
  estado: ConnectionState;
  onLigar: () => void;
  labelBotao: string;
  opcional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeader icon={icon} titulo={titulo} descricao={descricao} />
      <ol className="flex flex-col gap-2.5">
        {passos.map((passo, i) => (
          <li key={passo} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {i + 1}
            </span>
            {passo}
          </li>
        ))}
      </ol>
      {estado === "ligado" ? (
        <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Ligado com sucesso.
        </div>
      ) : (
        <Button onClick={onLigar} disabled={estado === "a-ligar"} className="w-fit">
          {estado === "a-ligar" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {labelBotao}
        </Button>
      )}
      {opcional && estado !== "ligado" && (
        <p className="text-xs text-muted-foreground">
          Podes saltar este passo e ligar mais tarde em Configurações → Canais.
        </p>
      )}
    </div>
  );
}
