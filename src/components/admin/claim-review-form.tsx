"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ClaimReviewFormProps = {
  claimId: string;
  disabled: boolean;
};

export function ClaimReviewForm({ claimId, disabled }: ClaimReviewFormProps) {
  const router = useRouter();
  const [adminNote, setAdminNote] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitDecision(decision: "approved" | "rejected") {
    startTransition(async () => {
      const response = await fetch(`/api/admin/claims/${claimId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          adminNote
        })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Could not update claim.");
        return;
      }

      setMessage(`Claim ${decision}.`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <textarea
        className="min-h-24 w-full rounded-[22px] border border-black/10 bg-white/80 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
        disabled={disabled || isPending}
        onChange={(event) => setAdminNote(event.target.value)}
        placeholder="Optional admin note"
        value={adminNote}
      />
      <div className="flex gap-3">
        <button
          className="rounded-full bg-[color:var(--surface-dark)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
          disabled={disabled || isPending}
          onClick={() => submitDecision("approved")}
          type="button"
        >
          Approve
        </button>
        <button
          className="rounded-full border border-black/10 bg-white/70 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--surface-dark)] disabled:opacity-60"
          disabled={disabled || isPending}
          onClick={() => submitDecision("rejected")}
          type="button"
        >
          Reject
        </button>
      </div>
      {message ? <p className="text-sm text-[color:var(--ink-soft)]">{message}</p> : null}
    </div>
  );
}
