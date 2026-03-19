import Link from "next/link";
import type { PropsWithChildren } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SettingsMenu } from "@/components/layout/settings-menu";
import { requireAdminActor } from "@/lib/viewer";

export default async function AdminLayout({ children }: PropsWithChildren) {
  const actor = await requireAdminActor("/admin/dashboard");

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc,#eef3f8)] text-[var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[#e6ebf2] bg-white/88 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <Link href="/admin/dashboard" className="text-lg font-semibold text-[#111b2d]">
                  Addis Beakal Admin
                </Link>
              </div>
              <div className="ml-auto">
                <SettingsMenu displayName={actor.user?.displayName ?? "Admin"} role={actor.role} />
              </div>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
