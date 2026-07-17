"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail, isAdminRole } from "@/lib/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<{ name: string; email: string; avatarUrl?: string }>({
    name: "Administrador",
    email: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        // Salvaguarda no cliente: o middleware já protege /admin no servidor;
        // isto é apenas uma rede de segurança adicional para quem não é admin.
        if (!isAdminRole(profile?.role) && !isAdminEmail(user.email)) {
          window.location.assign("/dashboard");
          return;
        }

        setAdmin({
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Administrador",
          email: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url,
        });
      }
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          userName={admin.name}
          userEmail={admin.email}
          avatarUrl={admin.avatarUrl}
          mobileNav={(close) => <AdminSidebar onNavigate={close} />}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
