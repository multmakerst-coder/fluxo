import type { SupabaseClient } from "@supabase/supabase-js";

// Definições globais da plataforma, persistidas na tabela `platform_settings`
// (par chave/valor). Ver supabase/schema.sql.
//
// NOTA: se a migração da tabela `platform_settings` ainda não tiver sido
// aplicada na base de dados em produção, as funções abaixo falham de forma
// controlada (devolvem o valor por omissão em vez de rebentar a página).

export const DEFAULT_TRIAL_DAYS = 14;
export const DEFAULT_SUPPORT_EMAIL = "suporte@fluxo.pt";

export async function getPlatformSetting<T>(
  supabase: SupabaseClient,
  key: string,
  fallback: T,
): Promise<{ value: T; persisted: boolean }> {
  const { data, error } = await supabase.from("platform_settings").select("value").eq("key", key).maybeSingle();

  if (error || !data) {
    return { value: fallback, persisted: false };
  }

  return { value: data.value as T, persisted: true };
}

export async function setPlatformSetting(
  supabase: SupabaseClient,
  key: string,
  value: unknown,
  updatedBy?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("platform_settings")
    .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: updatedBy ?? null });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
