"use client";

import {
  Activity,
  Building2,
  FileCheck2,
  LayoutDashboard,
  Settings2,
  Shield,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/claims", label: "Claims", icon: FileCheck2 },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/decisions", label: "Decisions", icon: FileCheck2 },
  { href: "/admin/admin", label: "Admin", icon: Shield },
  { href: "/admin/tools", label: "Tools", icon: Wrench }
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-[#1f2d45] bg-[#0f1726] text-white">
      <div className="border-b border-white/8 px-6 py-6">
        <Link className="flex items-center gap-3 font-semibold tracking-tight" href="/admin/dashboard">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(127,47,23,0.34)]">
            AB
          </span>
          <div>
            <p className="text-lg">Addis Beakal</p>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Admin Console</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/68 hover:bg-white/6 hover:text-white"
              )}
              href={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/8 px-4 py-4">
        <Link
          className="flex items-center gap-3 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          href="/admin/business/new"
        >
          <Building2 className="h-4 w-4" />
          Add Business
        </Link>
      </div>
    </aside>
  );
}
