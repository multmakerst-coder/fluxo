import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { NewPasswordForm } from "./new-password-form";

export const metadata: Metadata = {
  title: "Nova password",
};

export default function NovaPasswordPage() {
  return (
    <AuthShell
      title="Define uma nova password"
      description="Escolhe uma password forte para a tua conta."
    >
      <NewPasswordForm />
    </AuthShell>
  );
}
