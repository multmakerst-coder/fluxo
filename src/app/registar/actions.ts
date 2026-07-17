"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl, getAuthErrorMessage } from "@/lib/auth-url";

interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}

export async function signUpAction({ fullName, email, password }: SignUpInput) {
  const supabase = await createClient();
  const appUrl = await getAppUrl();

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: new URL("/auth/callback?redirect=/onboarding", appUrl).toString(),
      },
    });

    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }

  redirect(`/verificar-email?email=${encodeURIComponent(email)}`);
}

export async function signUpWithGoogleAction() {
  const supabase = await createClient();
  const appUrl = await getAppUrl();

  let oauthUrl: string | null = null;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: new URL("/auth/callback?redirect=/onboarding", appUrl).toString(),
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    oauthUrl = data.url;
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }

  if (!oauthUrl) {
    return { error: "Não foi possível iniciar sessão com o Google. Tenta novamente." };
  }

  redirect(oauthUrl);
}
