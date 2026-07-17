"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl, getAuthErrorMessage } from "@/lib/auth-url";

interface LoginInput {
  email: string;
  password: string;
  redirectTo?: string;
}

export async function loginAction({ email, password, redirectTo }: LoginInput) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }

  redirect(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
}

export async function loginWithGoogleAction(redirectTo?: string) {
  const supabase = await createClient();
  const appUrl = await getAppUrl();
  const callbackUrl = new URL("/auth/callback", appUrl);
  if (redirectTo) callbackUrl.searchParams.set("redirect", redirectTo);

  let oauthUrl: string | null = null;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
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
