"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = { name: "Admin Fluxo", email: "admin@fluxo.pt" };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          userName={admin.name}
          userEmail={admin.email}
          mobileNav={(close) => <AdminSidebar onNavigate={close} />}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
