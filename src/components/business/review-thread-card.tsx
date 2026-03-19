"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ReportForm } from "@/components/business/report-form";

type ReviewThreadCardProps = {
  businessId: string;
  thread: {
    id: string;
    status: "open" | "closed" | "removed";
    messages: Array<{
      id: string;
      senderRole: "owner" | "reviewer";
      body: string;
      createdAt: string;
    }>;
  };
  emptyLabel?: string;
  replyPlaceholder?: string;
};

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function ReviewThreadCard({
  businessId,
  thread,
  emptyLabel = "No messages yet.",
  replyPlaceholder = "Write a reply"
}: ReviewThreadCardProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4 rounded-[24px] border border-black/8 bg-white/72 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/44">Private thread</p>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
            {thread.status === "open" ? "Open conversation" : "Thread closed"}
          </p>
        </div>
        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-strong)]">
          {thread.messages.length} messages
        </span>
      </div>

      <div className="space-y-3">
        {thread.messages.length > 0 ? (
          thread.messages.map((entry) => (
            <article key={entry.id} className="rounded-[20px] border border-black/6 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                    {entry.senderRole === "owner" ? "Owner" : "Reviewer"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--surface-dark)]">{entry.body}</p>
                  <p className="mt-3 text-xs text-[color:var(--ink-soft)]">{formatTimestamp(entry.createdAt)}</p>
                </div>
                <ReportForm
                  businessId={businessId}
                  endpoint={`/api/review-threads/${thread.id}/messages/${entry.id}/reports`}
                  label="Report"
                  targetId={entry.id}
                  targetType="direct_message"
                />
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-black/8 bg-white/60 p-4 text-sm text-[color:var(--ink-soft)]">
            {emptyLabel}
          </div>
        )}
      </div>

      {thread.status === "open" ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");

            startTransition(async () => {
              const response = await fetch(`/api/review-threads/${thread.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body })
              });

              const payload = (await response.json()) as { error?: string };
              if (!response.ok) {
                setMessage(payload.error ?? "Could not send message.");
                return;
              }

              setBody("");
              setMessage("Message sent.");
              router.refresh();
            });
          }}
        >
          <textarea
            className="min-h-28 w-full rounded-[20px] border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
            disabled={isPending}
            onChange={(event) => setBody(event.target.value)}
            placeholder={replyPlaceholder}
            value={body}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[color:var(--ink-soft)]">
              Private follow-up stays attached to the original review.
            </p>
            <button
              className="rounded-full bg-[var(--surface-dark)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={isPending}
              type="submit"
            >
              Send message
            </button>
          </div>
          {message ? <p className="text-sm text-[color:var(--ink-soft)]">{message}</p> : null}
        </form>
      ) : null}
    </div>
  );
}
