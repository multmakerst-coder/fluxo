"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordRules, passwordMeetsAllRules } from "@/components/auth/password-rules";
import { updatePasswordAction } from "./actions";

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Introduz uma password.")
      .refine(passwordMeetsAllRules, "A password não cumpre os requisitos mínimos."),
    confirmPassword: z.string().min(1, "Confirma a password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As passwords não coincidem.",
    path: ["confirmPassword"],
  });

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export function NewPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = useWatch({ control, name: "password" });

  function onSubmit(values: NewPasswordValues) {
    setFormError(null);
    startTransition(async () => {
      const result = await updatePasswordAction(values.password);
      if (result?.error) {
        setFormError(result.error);
        toast.error(result.error);
      }
    });
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
          <Label htmlFor="password">Nova password</Label>
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
          <Label htmlFor="confirmPassword">Confirmar nova password</Label>
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

        <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isPending}>
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Repor password
        </Button>
      </form>
    </div>
  );
}
