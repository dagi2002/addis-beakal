import Link from "next/link";
import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type SiteShellProps = PropsWithChildren<{
  className?: string;
}>;

export function SiteShell({ children, className }: SiteShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(247,241,232,0.86)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">Addis Beakal</span>
            <span className="rounded-full border border-black/10 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-black/55">
              Phase 1
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-black/70">
            <Link className="rounded-full px-3 py-2 transition hover:bg-black/5" href="/discover">
              Discover
            </Link>
            <Link
              className="rounded-full bg-black px-4 py-2 text-white transition hover:bg-black/85"
              href="/#reporting-and-moderation"
            >
              Trust & safety
            </Link>
          </nav>
        </div>
      </header>
      <main className={cn("mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8", className)}>
        {children}
      </main>
    </div>
  );
}
