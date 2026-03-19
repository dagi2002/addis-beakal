"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

type SaveButtonProps = {
  businessId: string;
  initialSaved: boolean;
  initialSaveCount: number;
  className?: string;
  compact?: boolean;
};

export function SaveButton({
  businessId,
  initialSaved,
  initialSaveCount,
  className,
  compact = false
}: SaveButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [saveCount, setSaveCount] = useState(initialSaveCount);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={cn(
        compact
          ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[rgba(255,250,242,0.86)] text-[#2a1a10] shadow-[0_14px_35px_rgba(36,22,11,0.18)] transition hover:-translate-y-0.5"
          : "inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,250,242,0.84)] px-4 py-2.5 text-sm font-medium text-[#2a1a10] shadow-[0_18px_40px_rgba(57,39,22,0.1)] transition hover:-translate-y-0.5",
        saved && "border-[rgba(197,91,45,0.28)] bg-[rgba(197,91,45,0.12)] text-[var(--accent-strong)]",
        className
      )}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const response = await fetch("/api/saves/toggle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessId })
          });

          if (response.status === 401) {
            router.push(`/login?next=${encodeURIComponent(pathname || "/discover")}`);
            return;
          }

          if (!response.ok) {
            return;
          }

          const payload = (await response.json()) as { saved: boolean; saveCount: number };
          setSaved(payload.saved);
          setSaveCount(payload.saveCount);
        });
      }}
      type="button"
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
      {compact ? <span className="sr-only">{saved ? "Saved" : "Save"}</span> : <span>{saved ? "Saved" : "Save"}</span>}
      {compact ? null : <span className="text-[var(--muted)]">{saveCount}</span>}
    </button>
  );
}
