import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectParam = searchParams.get("redirect");
  const next = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Sem projeto Supabase configurado (env vars em falta) ou erro de rede —
      // cai para o redirect de erro abaixo em vez de rebentar o pedido.
    }
  }

  return NextResponse.redirect(`${origin}/entrar?error=auth`);
}
