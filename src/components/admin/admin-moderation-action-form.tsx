"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminModerationActionFormProps = {
  reportId: string;
  targetType: "business" | "review" | "owner_reply" | "direct_message";
  status: "open" | "resolved" | "dismissed";
};

export function AdminModerationActionForm({
  reportId,
  targetType,
  status
}: AdminModerationActionFormProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function runAction(action: "dismiss" | "remove_content" | "restore_content" | "close_thread" | "suspend_owner_messaging") {
    startTransition(async () => {
      const response = await fetch(`/api/admin/moderation/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Could not apply moderation action.");
        return;
      }

      setMessage("Moderation updated.");
      router.refresh();
    });
  }

  const canRemoveOrRestore = targetType !== "business";
  const canCloseThread = targetType === "direct_message";

  return (
    <div className="space-y-4 rounded-[22px] border border-[#e5ebf3] bg-[#fbfcfe] p-4">
      <textarea
        className="min-h-24 w-full rounded-[18px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
        disabled={isPending}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Optional moderation note"
        value={note}
      />
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full border border-[#d6dce5] bg-white px-4 py-2 text-sm font-semibold text-[#46576d] disabled:opacity-50"
          disabled={isPending || status !== "open"}
          onClick={() => runAction("dismiss")}
          type="button"
        >
          Dismiss
        </button>
        {canRemoveOrRestore ? (
          <>
            <button
              className="rounded-full bg-[#b7483a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={isPending}
              onClick={() => runAction("remove_content")}
              type="button"
            >
              Remove content
            </button>
            <button
              className="rounded-full border border-[#cbe8d9] bg-[#effaf4] px-4 py-2 text-sm font-semibold text-[#19754e] disabled:opacity-50"
              disabled={isPending}
              onClick={() => runAction("restore_content")}
              type="button"
            >
              Restore content
            </button>
          </>
        ) : null}
        {canCloseThread ? (
          <button
            className="rounded-full border border-[#d8e2ee] bg-white px-4 py-2 text-sm font-semibold text-[#46576d] disabled:opacity-50"
            disabled={isPending}
            onClick={() => runAction("close_thread")}
            type="button"
          >
            Close thread
          </button>
        ) : null}
        <button
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={isPending}
          onClick={() => runAction("suspend_owner_messaging")}
          type="button"
        >
          Suspend owner messaging
        </button>
      </div>
      {message ? <p className="text-sm text-[#66768c]">{message}</p> : null}
    </div>
  );
}
