"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthErrorMessage } from "@/lib/auth-url";

export async function updatePasswordAction(password: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }

  redirect("/entrar?reset=sucesso");
}
