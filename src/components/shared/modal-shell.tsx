"use client";

import { type PropsWithChildren, useId } from "react";

import { cn } from "@/lib/utils";

type ModalShellProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  className?: string;
}>;

export function ModalShell({
  children,
  open,
  onClose,
  title,
  description,
  className
}: ModalShellProps) {
  const titleId = useId();

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 flex items-end bg-black/45 p-4 transition md:items-center md:justify-center",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <button
        aria-label="Close modal"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "glass-panel relative z-10 w-full max-w-2xl rounded-[32px] p-5 md:p-6",
          className
        )}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-[var(--font-heading)] text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#23170f]" id={titleId}>
              {title}
            </h2>
            {description ? <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
          </div>
          <button className="text-sm text-[var(--muted)]" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
