"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

type SaveButtonProps = {
  businessId: string;
  initialSaved: boolean;
  initialSaveCount: number;
  className?: string;
};

export function SaveButton({
  businessId,
  initialSaved,
  initialSaveCount,
  className
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [saveCount, setSaveCount] = useState(initialSaveCount);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-black shadow-soft transition hover:-translate-y-0.5",
        saved && "border-clay/30 bg-clay/10 text-clay",
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
      <span>{saved ? "Saved" : "Save"}</span>
      <span className="text-black/55">{saveCount}</span>
    </button>
  );
}
