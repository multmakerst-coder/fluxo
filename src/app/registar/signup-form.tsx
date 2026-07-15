"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleIcon } from "@/components/auth/google-icon";
import { PasswordRules, passwordMeetsAllRules } from "@/components/auth/password-rules";
import { signUpAction, signUpWithGoogleAction } from "./actions";

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Introduz o teu nome completo."),
    email: z.string().min(1, "Introduz o teu email.").email("Email inválido."),
    password: z
      .string()
      .min(1, "Introduz uma password.")
      .refine(passwordMeetsAllRules, "A password não cumpre os requisitos mínimos."),
    confirmPassword: z.string().min(1, "Confirma a password."),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "Tens de aceitar os termos para continuar.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As passwords não coincidem.",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = useWatch({ control, name: "password" });

  function onSubmit(values: SignUpValues) {
    setFormError(null);
    startTransition(async () => {
      const result = await signUpAction(values);
      if (result?.error) {
        setFormError(result.error);
        toast.error(result.error);
      }
    });
  }

  function onGoogleClick() {
    setFormError(null);
    startGoogleTransition(async () => {
      const result = await signUpWithGoogleAction();
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
        disabled={isGooglePending}
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
        <span className="text-xs text-muted-foreground">ou regista-te com email</span>
        <Separator className="flex-1" />
      </div>

      {formError ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="O teu nome"
            className="h-11 rounded-xl"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          {errors.fullName ? (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          ) : null}
        </div>

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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 rounded-xl"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <PasswordRules password={password ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirmar password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 rounded-xl"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="acceptTerms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={!!errors.acceptTerms}
                  className="mt-0.5"
                />
                <Label htmlFor="acceptTerms" className="text-sm font-normal text-muted-foreground">
                  Aceito os{" "}
                  <Link href="/termos" className="font-medium text-primary hover:underline">
                    termos e condições
                  </Link>
                </Label>
              </div>
              {errors.acceptTerms ? (
                <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
              ) : null}
            </div>
          )}
        />

        <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isPending}>
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tens conta?{" "}
        <Link href="/entrar" className="font-medium text-primary hover:underline">
          Entra
        </Link>
      </p>
    </div>
  );
}
