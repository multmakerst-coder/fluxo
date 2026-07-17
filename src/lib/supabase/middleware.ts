import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail, isAdminRole } from "@/lib/admin";

const CLIENT_PREFIX = "/dashboard";
const ADMIN_PREFIX = "/admin";
const AUTH_PAGES = ["/entrar", "/registar", "/recuperar-password", "/nova-password"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isClientRoute = path.startsWith(CLIENT_PREFIX);
  const isAdminRoute = path.startsWith(ADMIN_PREFIX);
  const isAuthPage = AUTH_PAGES.some((page) => path.startsWith(page));

  if (!user && (isClientRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // profiles.role na base de dados é a fonte de verdade para quem é admin.
  // ADMIN_EMAIL é apenas um "bootstrap" de segurança (ver src/lib/admin.ts).
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = isAdminRole(profile?.role) || isAdminEmail(user.email);
  }

  if (user && isAdminRoute && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isClientRoute && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
