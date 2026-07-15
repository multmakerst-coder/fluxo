import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a service role key — só deve ser usado em contextos de servidor sem
// sessão de utilizador (ex: cron jobs, webhooks) onde precisamos de bypass a RLS
// para processar dados de todos os clientes.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Configuração do Supabase (service role) em falta");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
