import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendVerificationEmail } from "./resend-button";

export const metadata: Metadata = {
  title: "Verifica o teu email",
};

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthShell title="Verifica o teu email" description="Falta só um passo para começares.">
      <ResendVerificationEmail email={email} />
    </AuthShell>
  );
}
