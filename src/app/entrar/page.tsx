import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string; reset?: string }>;
}) {
  const { redirect, error, reset } = await searchParams;

  return (
    <AuthShell title="Entrar na tua conta" description="Bem-vindo de volta ao Fluxo.">
      <LoginForm
        redirectTo={redirect}
        notice={
          error === "auth"
            ? { variant: "error", message: "Não foi possível concluir o início de sessão. Tenta novamente." }
            : reset === "sucesso"
              ? { variant: "success", message: "Password atualizada com sucesso. Já podes entrar." }
              : undefined
        }
      />
    </AuthShell>
  );
}
