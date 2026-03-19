"use client";

import { Flag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ModalShell } from "@/components/shared/modal-shell";

type ReportFormProps = {
  businessId: string;
  reviewId?: string;
  label?: string;
};

const reasons = [
  "Spam or promotional",
  "Harassment or hate",
  "False information",
  "Off-topic",
  "Other"
];

export function ReportForm({ businessId, reviewId, label = "Report" }: ReportFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <button
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.66)] px-4 py-2.5 text-sm text-[var(--muted-strong)] transition hover:bg-[rgba(197,91,45,0.08)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Flag className="h-4 w-4" />
        {label}
      </button>

      <ModalShell
        description="Use this to flag a listing or review for moderation. Reports create a real moderation record instead of disappearing into client-only state."
        onClose={() => setOpen(false)}
        open={open}
        title={reviewId ? "Report this review" : "Report this listing"}
      >
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");

            startTransition(async () => {
              const response = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  businessId,
                  reviewId,
                  reason,
                  details,
                  contactEmail
                })
              });

              const payload = (await response.json()) as { message?: string; error?: string };

              if (response.status === 401) {
                router.push(`/login?next=${encodeURIComponent(pathname || "/discover")}`);
                return;
              }

              if (!response.ok) {
                setMessage(payload.error ?? "We could not submit that report.");
                return;
              }

              setDetails("");
              setContactEmail("");
              setOpen(false);
              setMessage(payload.message ?? "Report submitted.");
            });
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            >
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="Optional contact email"
              type="email"
              value={contactEmail}
            />
          </div>
          <textarea
            className="min-h-32 w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Tell us what happened and why this should be reviewed."
            value={details}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="max-w-xl text-xs leading-5 text-[var(--muted)]">
              Reports enter a moderation queue. If a review is later removed, it no longer contributes
              to the business rating or review count.
            </p>
            <button
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={isPending}
              type="submit"
            >
              Submit report
            </button>
          </div>
        </form>
      </ModalShell>

      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
