import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RecoverPasswordForm } from "./recover-form";

export const metadata: Metadata = {
  title: "Recuperar password",
};

export default function RecuperarPasswordPage() {
  return (
    <AuthShell
      title="Recuperar password"
      description="Indica o teu email e enviamos-te um link para repor a password."
    >
      <RecoverPasswordForm />
    </AuthShell>
  );
}
