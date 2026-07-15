import { headers } from "next/headers";

/**
 * Resolve a base URL usável em redirectTo/emailRedirectTo do Supabase Auth.
 * Prioriza NEXT_PUBLIC_APP_URL (definida em produção) e recorre ao header
 * "origin" do pedido em desenvolvimento local.
 */
export async function getAppUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const headersList = await headers();
  const origin = headersList.get("origin");
  if (origin) return origin;

  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

/** Mensagem de erro genérica para exceções inesperadas (env vars em falta, rede, etc.). */
export function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tenta novamente mais tarde.";
}
