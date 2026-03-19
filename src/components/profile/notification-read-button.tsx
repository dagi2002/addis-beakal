"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type NotificationReadButtonProps = {
  notificationId: string;
  initialStatus: "unread" | "read";
};

export function NotificationReadButton({
  notificationId,
  initialStatus
}: NotificationReadButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  if (status === "read") {
    return (
      <span className="rounded-full border border-[#d8e2ee] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7b91]">
        Read
      </span>
    );
  }

  return (
    <button
      className="rounded-full border border-[#d8e2ee] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#111b2d] transition hover:bg-[#f7f9fc] disabled:opacity-60"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const response = await fetch(`/api/notifications/${notificationId}`, {
            method: "PATCH"
          });

          if (!response.ok) {
            return;
          }

          setStatus("read");
          router.refresh();
        });
      }}
      type="button"
    >
      Mark read
    </button>
  );
}
