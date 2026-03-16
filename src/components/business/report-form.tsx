"use client";

import { Flag } from "lucide-react";
import { useState, useTransition } from "react";

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
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <button
        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-sm text-black/65 transition hover:bg-black/5"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Flag className="h-4 w-4" />
        {label}
      </button>

      {open ? (
        <form
          className="space-y-3 rounded-3xl border border-black/8 bg-white/80 p-4"
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
              className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 outline-none transition focus:border-clay"
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
              className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 outline-none transition focus:border-clay"
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="Optional contact email"
              type="email"
              value={contactEmail}
            />
          </div>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-black/10 bg-black/5 px-4 py-3 outline-none transition focus:border-clay"
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Tell us what happened and why this should be reviewed."
            value={details}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-black/50">Reports enter a moderation queue and are excluded from public scoring when removed.</p>
            <button
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={isPending}
              type="submit"
            >
              Submit report
            </button>
          </div>
        </form>
      ) : null}

      {message ? <p className="text-sm text-black/60">{message}</p> : null}
    </div>
  );
}
