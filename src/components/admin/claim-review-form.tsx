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
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8091a8]">Admin note</p>
        <p className="text-sm text-[#66768c]">
          Add context for the claimant or for the next reviewer before recording your decision.
        </p>
      </div>
      <textarea
        className="min-h-28 w-full rounded-[22px] border border-[#d8e2ee] bg-white px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-[#7a8da4] focus:border-[color:var(--accent)]"
        disabled={disabled || isPending}
        onChange={(event) => setAdminNote(event.target.value)}
        placeholder="Optional admin note"
        value={adminNote}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-[20px] bg-[#1a7f57] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
          disabled={disabled || isPending}
          onClick={() => submitDecision("approved")}
          type="button"
        >
          Approve
        </button>
        <button
          className="rounded-[20px] border border-[#e4b5b2] bg-[#fff6f5] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#b7483a] disabled:opacity-60"
          disabled={disabled || isPending}
          onClick={() => submitDecision("rejected")}
          type="button"
        >
          Reject
        </button>
      </div>
      {message ? (
        <p className={`text-sm ${message.includes("approved") ? "text-[#1a7f57]" : "text-[#b7483a]"}`}>{message}</p>
      ) : null}
    </div>
  );
}
