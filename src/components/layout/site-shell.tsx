import { Search } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";
import { getSessionActor } from "@/lib/viewer";

type SiteShellProps = PropsWithChildren<{
  className?: string;
  showHeaderSearch?: boolean;
  compactMain?: boolean;
}>;

export async function SiteShell({
  children,
  className,
  showHeaderSearch = false,
  compactMain = false
}: SiteShellProps) {
  const actor = await getSessionActor();

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 lg:px-8">
        <div className="glass-panel mx-auto flex w-full max-w-[1280px] items-center gap-4 rounded-[28px] px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-[#23170f]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-base text-white shadow-[0_12px_30px_rgba(127,47,23,0.32)]">
              H
            </span>
            <span className="text-xl">
              Habesha<span className="text-[var(--accent)]">Local</span>
            </span>
          </Link>

          {showHeaderSearch ? (
            <div className="hidden flex-1 items-center justify-center xl:flex">
              <div className="flex w-full max-w-[360px] items-center gap-3 rounded-full border border-[var(--border)] bg-[rgba(255,248,239,0.86)] px-5 py-3 text-sm text-[var(--muted)]">
                <Search className="h-4 w-4" />
                <span>Search restaurants, cafes, salons, and places worth returning to</span>
              </div>
            </div>
          ) : (
            <div className="hidden flex-1 xl:block" />
          )}

          <nav className="ml-auto flex flex-wrap items-center justify-end gap-2 text-sm text-[var(--muted-strong)]">
            <Link className="rounded-full px-4 py-2.5 transition hover:bg-[rgba(197,91,45,0.1)]" href="/discover">
              Explore
            </Link>
            <Link className="rounded-full px-4 py-2.5 transition hover:bg-[rgba(197,91,45,0.1)]" href="/saved">
              Saved
            </Link>
            {actor.userId ? (
              <>
                <Link className="rounded-full px-4 py-2.5 transition hover:bg-[rgba(197,91,45,0.1)]" href="/profile">
                  Profile
                </Link>
                <Link className="rounded-full px-4 py-2.5 transition hover:bg-[rgba(197,91,45,0.1)]" href="/claim-business">
                  Claim
                </Link>
                {actor.role === "owner" || actor.role === "admin" ? (
                  <Link className="rounded-full px-4 py-2.5 transition hover:bg-[rgba(197,91,45,0.1)]" href="/owner">
                    Owner
                  </Link>
                ) : null}
                {actor.role === "admin" ? (
                  <Link className="rounded-full px-4 py-2.5 transition hover:bg-[rgba(197,91,45,0.1)]" href="/admin/claims">
                    Admin
                  </Link>
                ) : null}
                <SignOutButton className="rounded-full bg-[var(--surface-dark)] px-5 py-2.5 text-white transition hover:bg-[#152019]" />
              </>
            ) : (
              <>
                <Link className="rounded-full px-4 py-2.5 transition hover:bg-[rgba(197,91,45,0.1)]" href="/login">
                  Sign in
                </Link>
                <Link
                  className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white transition hover:bg-[var(--accent-strong)]"
                  href="/signup"
                >
                  Join
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto flex w-full max-w-[1280px] flex-col px-3 py-6 sm:px-5 lg:px-8",
          compactMain ? "gap-8" : "gap-12",
          className
        )}
      >
        {children}
      </main>

      <footer className="px-3 pb-4 pt-8 sm:px-5 lg:px-8">
        <div className="dark-panel grain-overlay mx-auto overflow-hidden rounded-[34px] text-white">
          <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-6 py-12 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1fr] lg:px-10">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-base text-white">
                  H
                </span>
                <span className="text-xl">
                  Habesha<span className="text-[#f3bf74]">Local</span>
                </span>
              </Link>
              <p className="max-w-sm text-sm leading-7 text-white/68">
                A warmer, sharper way to explore Addis. Find standout places, read grounded reviews,
                and build a shortlist that feels local instead of generic.
              </p>
            </div>
            <div className="space-y-3 text-sm text-white/65">
              <p className="font-semibold text-white">Explore</p>
              <p>Restaurants</p>
              <p>Cafes</p>
              <p>Hotels</p>
              <p>Salons</p>
              <p>Culture</p>
              <p>Bakery</p>
            </div>
            <div className="space-y-3 text-sm text-white/65">
              <p className="font-semibold text-white">Neighborhoods</p>
              <p>Bole</p>
              <p>Kazanchis</p>
              <p>Piassa</p>
              <p>Mexico</p>
              <p>Atlas</p>
              <p>City center</p>
            </div>
            <div className="space-y-3 text-sm text-white/65">
              <p className="font-semibold text-white">Build With Us</p>
              <p>Claim your business</p>
              <p>Owner tools</p>
              <p>Moderation standards</p>
              <p>Contact</p>
              <p>Privacy</p>
              <p>Terms</p>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 border-t border-white/10 px-6 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <span>© 2026 HabeshaLocal. Designed for discovering Addis with more texture and trust.</span>
            <span>Addis Ababa, Ethiopia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
