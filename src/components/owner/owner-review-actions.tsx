"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ReviewThreadCard } from "@/components/business/review-thread-card";

type OwnerReviewActionsProps = {
  businessId: string;
  reviewId: string;
  messagingDisabled: boolean;
  ownerReply?: {
    id: string;
    body: string;
  } | null;
  thread?: {
    id: string;
    status: "open" | "closed" | "removed";
    messages: Array<{
      id: string;
      senderRole: "owner" | "reviewer";
      body: string;
      createdAt: string;
    }>;
  } | null;
};

export function OwnerReviewActions({
  businessId,
  reviewId,
  messagingDisabled,
  ownerReply,
  thread
}: OwnerReviewActionsProps) {
  const router = useRouter();
  const [replyBody, setReplyBody] = useState(ownerReply?.body ?? "");
  const [threadBody, setThreadBody] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitReply(method: "POST" | "PATCH") {
    setMessage("");
    startTransition(async () => {
      const response = await fetch(`/api/reviews/${reviewId}/owner-reply`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Could not save owner reply.");
        return;
      }

      setMessage(method === "POST" ? "Public reply published." : "Public reply updated.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-black/44">Reply below the review</p>
        <textarea
          className="mt-4 min-h-28 w-full rounded-[20px] border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
          disabled={isPending}
          onChange={(event) => setReplyBody(event.target.value)}
          placeholder="Reply publicly below this review so future visitors can see how you handle feedback."
          value={replyBody}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-xs leading-5 text-[color:var(--ink-soft)]">
            Keep it professional and specific. Public replies stay attached to this review.
          </p>
          <div className="flex flex-wrap gap-2">
            {ownerReply ? (
              <button
                className="rounded-full border border-[#e5b8b3] bg-[#fff5f4] px-4 py-2 text-sm font-semibold text-[#b14a40] disabled:opacity-50"
                disabled={isPending}
                onClick={() => {
                  setMessage("");
                  startTransition(async () => {
                    const response = await fetch(`/api/reviews/${reviewId}/owner-reply`, {
                      method: "DELETE"
                    });
                    const payload = (await response.json()) as { error?: string };
                    if (!response.ok) {
                      setMessage(payload.error ?? "Could not remove owner reply.");
                      return;
                    }

                    setReplyBody("");
                    setMessage("Public reply removed.");
                    router.refresh();
                  });
                }}
                type="button"
              >
                Remove
              </button>
            ) : null}
            <button
              className="rounded-full bg-[var(--surface-dark)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={isPending}
              onClick={() => submitReply(ownerReply ? "PATCH" : "POST")}
              type="button"
            >
              {ownerReply ? "Update public reply" : "Reply below review"}
            </button>
          </div>
        </div>
      </div>

      {thread ? (
        <ReviewThreadCard
          businessId={businessId}
          replyPlaceholder="Continue the private follow-up"
          thread={thread}
        />
      ) : (
        <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/44">Private message to reviewer</p>
          <textarea
            className="mt-4 min-h-28 w-full rounded-[20px] border border-black/8 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
            disabled={isPending || messagingDisabled}
            onChange={(event) => setThreadBody(event.target.value)}
            placeholder={
              messagingDisabled
                ? "Messaging is currently suspended for this business."
                : "Send a private follow-up when you need to take the conversation off the public page."
            }
            value={threadBody}
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="max-w-xl text-xs leading-5 text-[color:var(--ink-soft)]">
              Only the owner and the review author can see this thread. Reviewers receive it in
              the bell inbox and the private follow-up section of their profile page.
            </p>
            <button
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={isPending || messagingDisabled}
              onClick={() => {
                setMessage("");
                startTransition(async () => {
                  const response = await fetch(`/api/reviews/${reviewId}/thread`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ body: threadBody })
                  });

                  const payload = (await response.json()) as { error?: string };
                  if (!response.ok) {
                    setMessage(payload.error ?? "Could not start private thread.");
                    return;
                  }

                  setThreadBody("");
                  setMessage("Private thread started.");
                  router.refresh();
                });
              }}
              type="button"
            >
              Send private message
            </button>
          </div>
        </div>
      )}

      {message ? <p className="text-sm text-[color:var(--ink-soft)]">{message}</p> : null}
    </div>
  );
}
