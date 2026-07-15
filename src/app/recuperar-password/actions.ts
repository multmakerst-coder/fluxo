"use server";

import { createClient } from "@/lib/supabase/server";
import { getAppUrl, getAuthErrorMessage } from "@/lib/auth-url";

export async function requestPasswordResetAction(email: string) {
  const supabase = await createClient();
  const appUrl = await getAppUrl();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/nova-password", appUrl).toString(),
    });

    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }

  return { success: true };
}
