import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type PillProps = PropsWithChildren<{
  className?: string;
}>;

export function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-black/10 bg-white/75 px-3 py-1 text-xs font-medium text-black/70",
        className
      )}
    >
      {children}
    </span>
  );
}
