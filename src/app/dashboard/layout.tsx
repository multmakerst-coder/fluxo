"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail, isAdminRole } from "@/lib/admin";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl?: string }>({
    name: "Utilizador",
    email: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", supabaseUser.id)
          .maybeSingle();

        // Salvaguarda no cliente: o middleware já trata este redirecionamento
        // no servidor; isto é apenas uma rede de segurança adicional.
        if (isAdminRole(profile?.role) || isAdminEmail(supabaseUser.email)) {
          window.location.assign("/admin");
          return;
        }

        setUser({
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "Utilizador",
          email: supabaseUser.email || "",
          avatarUrl: supabaseUser.user_metadata?.avatar_url,
        });
      }
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          userName={user.name}
          userEmail={user.email}
          avatarUrl={user.avatarUrl}
          mobileNav={(close) => <DashboardSidebar onNavigate={close} />}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
