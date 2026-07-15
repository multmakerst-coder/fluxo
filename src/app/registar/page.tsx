import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function RegistarPage() {
  return (
    <AuthShell
      title="Cria a tua conta"
      description="Começa a automatizar WhatsApp, Instagram e Email em minutos."
    >
      <SignUpForm />
    </AuthShell>
  );
}
