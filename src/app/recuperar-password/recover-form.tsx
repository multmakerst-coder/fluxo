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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { requestPasswordResetAction } from "./actions";

const recoverSchema = z.object({
  email: z.string().min(1, "Introduz o teu email.").email("Email inválido."),
});

type RecoverValues = z.infer<typeof recoverSchema>;

export function RecoverPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: RecoverValues) {
    setFormError(null);
    startTransition(async () => {
      const result = await requestPasswordResetAction(values.email);
      if (result?.error) {
        setFormError(result.error);
        toast.error(result.error);
        return;
      }
      setSent(values.email);
      toast.success("Email de recuperação enviado.");
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
          <CircleCheck className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          Se existir uma conta associada a <span className="font-medium text-foreground">{sent}</span>,
          vais receber um email com instruções para repor a password.
        </p>
        <Link href="/entrar" className="text-sm font-medium text-primary hover:underline">
          Voltar a entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {formError ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{formError}</AlertDescription>
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
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isPending}>
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Enviar link de recuperação
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Lembraste-te da password?{" "}
        <Link href="/entrar" className="font-medium text-primary hover:underline">
          Entra
        </Link>
      </p>
    </div>
  );
}
