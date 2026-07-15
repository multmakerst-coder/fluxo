"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = { name: "Marta Silva", email: "marta@negocio.pt" };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          userName={user.name}
          userEmail={user.email}
          mobileNav={(close) => <DashboardSidebar onNavigate={close} />}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
