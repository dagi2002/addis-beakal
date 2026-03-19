"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type NotificationBellProps = {
  unreadCount: number;
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    status: "unread" | "read";
    href: string;
    sender: { displayName: string } | null;
  }>;
};

export function NotificationBell({ unreadCount, notifications }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative">
      <button
        aria-label="Open inbox notifications"
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[rgba(197,91,45,0.1)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className="absolute right-0 z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-[24px] border border-[var(--border)] bg-white p-3 shadow-[0_24px_60px_rgba(33,46,70,0.14)]">
            <div className="rounded-[18px] bg-[var(--background-strong)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Inbox</p>
              <p className="mt-1 font-semibold text-[color:var(--surface-dark)]">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-3 space-y-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className="block w-full rounded-[18px] border border-[#edf2f7] bg-[#fbfcfe] px-4 py-3 text-left transition hover:bg-white disabled:opacity-60"
                    disabled={isPending}
                    onClick={() => {
                      setOpen(false);
                      startTransition(async () => {
                        if (notification.status === "unread") {
                          await fetch(`/api/notifications/${notification.id}`, {
                            method: "PATCH"
                          });
                        }

                        router.push(notification.href);
                        router.refresh();
                      });
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[color:var(--surface-dark)]">{notification.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[color:var(--ink-soft)]">
                          {notification.body}
                        </p>
                        {notification.sender ? (
                          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted-strong)]">
                            From {notification.sender.displayName}
                          </p>
                        ) : null}
                      </div>
                      {notification.status === "unread" ? (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                      ) : null}
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#edf2f7] px-4 py-6 text-sm text-[color:var(--ink-soft)]">
                  No notifications yet.
                </div>
              )}
            </div>

            <div className="mt-3 border-t border-[#edf2f7] pt-3">
              <button
                className="w-full rounded-[16px] px-4 py-3 text-left text-sm font-semibold text-[color:var(--surface-dark)] transition hover:bg-[#f7f9fc]"
                onClick={() => {
                  setOpen(false);
                  router.push("/notifications");
                }}
                type="button"
              >
                View full inbox
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
