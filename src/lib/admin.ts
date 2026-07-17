// Fonte única de verdade para o email de administrador da plataforma.
//
// A autorização "a sério" (proteção de rotas /admin, RLS na base de dados) é
// feita através da coluna `profiles.role` (ver supabase/schema.sql,
// auth_is_admin()). Este email serve apenas de "bootstrap": garante que esta
// conta específica é sempre tratada como admin mesmo que o valor em
// `profiles.role` ainda não tenha sido definido (ex.: seed inicial, migração
// futura). Não adicionar aqui outros emails de teste — para dar acesso de
// admin a mais alguém, define `role = 'admin'` no perfil dessa pessoa na
// base de dados.
export const ADMIN_EMAIL = "isildotavarespt@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").toLowerCase() === ADMIN_EMAIL;
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}
