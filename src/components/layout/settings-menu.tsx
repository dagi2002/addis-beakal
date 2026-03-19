"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import type { AppRole } from "@/server/auth/actor";

type SettingsMenuProps = {
  displayName: string;
  role: AppRole;
};

export function SettingsMenu({ displayName, role }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 transition hover:bg-[rgba(197,91,45,0.1)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        Settings
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <>
          <button
            aria-label="Close settings menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className="absolute right-0 z-50 mt-3 w-64 rounded-[24px] border border-[var(--border)] bg-white p-3 shadow-[0_24px_60px_rgba(33,46,70,0.14)]">
            <div className="rounded-[18px] bg-[var(--background-strong)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Signed in as</p>
              <p className="mt-1 font-semibold text-[color:var(--surface-dark)]">{displayName}</p>
            </div>

            <div className="mt-3 flex flex-col">
              <Link
                className="rounded-[16px] px-4 py-3 text-sm text-[color:var(--surface-dark)] hover:bg-[#f7f9fc]"
                href="/notifications"
              >
                Inbox
              </Link>
              <Link
                className="rounded-[16px] px-4 py-3 text-sm text-[color:var(--surface-dark)] hover:bg-[#f7f9fc]"
                href="/profile?section=settings"
              >
                Account settings
              </Link>
              {role === "owner" || role === "admin" ? (
                <Link
                  className="rounded-[16px] px-4 py-3 text-sm text-[color:var(--surface-dark)] hover:bg-[#f7f9fc]"
                  href="/owner"
                >
                  Owner dashboard
                </Link>
              ) : null}
              <Link className="rounded-[16px] px-4 py-3 text-sm text-[color:var(--surface-dark)] hover:bg-[#f7f9fc]" href="/saved">
                Saved places
              </Link>
              {role === "admin" ? (
                <Link className="rounded-[16px] px-4 py-3 text-sm text-[color:var(--surface-dark)] hover:bg-[#f7f9fc]" href="/admin/dashboard">
                  Admin panel
                </Link>
              ) : null}
              <div className="mt-2 border-t border-[#edf2f7] pt-2">
                <SignOutButton className="w-full rounded-[16px] px-4 py-3 text-left text-sm text-[color:var(--surface-dark)] transition hover:bg-[#f7f9fc]" />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
