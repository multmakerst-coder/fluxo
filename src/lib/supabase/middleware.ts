import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const email = user?.email || "";
  const isAdminEmail = [
    "multmakerst@gmail.com",
    "isildotavares@gmail.com",
    "isildo@gmail.com",
    "isildotavaresst@gmail.com",
    "isildotavarespt@gmail.com",
    "admin@fluxo.pt"
  ].includes(email.toLowerCase());

  if (user && isAdminRoute) {
    const role = (user.app_metadata?.role as string | undefined) ?? "client";
    if (role !== "admin" && role !== "super_admin" && !isAdminEmail) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (user && isClientRoute && isAdminEmail) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminEmail ? "/admin" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
