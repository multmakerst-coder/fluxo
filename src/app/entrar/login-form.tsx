"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleIcon } from "@/components/auth/google-icon";
import { loginAction, loginWithGoogleAction } from "./actions";

const MAX_FAILED_ATTEMPTS = 5;

const loginSchema = z.object({
  email: z.string().min(1, "Introduz o teu email.").email("Email inválido."),
  password: z.string().min(1, "Introduz a tua password."),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginNotice {
  variant: "error" | "success";
  message: string;
}

export function LoginForm({
  redirectTo,
  notice,
}: {
  redirectTo?: string;
  notice?: LoginNotice;
}) {
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const rateLimited = failedAttempts >= MAX_FAILED_ATTEMPTS;

  function onSubmit(values: LoginValues) {
    if (rateLimited) return;
    setFormError(null);

    startTransition(async () => {
      const result = await loginAction({ ...values, redirectTo });
      if (result?.error) {
        setFailedAttempts((count) => count + 1);
        setFormError(result.error);
        toast.error(result.error);
      }
    });
  }

  function onGoogleClick() {
    setFormError(null);
    startGoogleTransition(async () => {
      const result = await loginWithGoogleAction(redirectTo);
      if (result?.error) {
        setFormError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full rounded-xl"
        onClick={onGoogleClick}
        disabled={isGooglePending || rateLimited}
      >
        {isGooglePending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="h-4 w-4" />
        )}
        Continuar com Google
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">ou entra com email</span>
        <Separator className="flex-1" />
      </div>

      {notice ? (
        <Alert
          variant={notice.variant === "error" ? "destructive" : "default"}
          className={notice.variant === "success" ? "border-success/30 text-success" : undefined}
        >
          {notice.variant === "error" ? (
            <CircleAlert />
          ) : (
            <CircleCheck className="text-success" />
          )}
          <AlertDescription className={notice.variant === "success" ? "text-success/90" : undefined}>
            {notice.message}
          </AlertDescription>
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      {rateLimited ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>
            Demasiadas tentativas, tenta novamente mais tarde.
          </AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@empresa.pt"
            className="h-11 rounded-xl"
            aria-invalid={!!errors.email}
            disabled={rateLimited}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/recuperar-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Esqueci a password
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 rounded-xl"
            aria-invalid={!!errors.password}
            disabled={rateLimited}
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-xl"
          disabled={isPending || rateLimited}
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tens conta?{" "}
        <Link href="/registar" className="font-medium text-primary hover:underline">
          Regista-te
        </Link>
      </p>
    </div>
  );
}
