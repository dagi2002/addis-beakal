"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminNotificationComposerProps = {
  users: Array<{
    id: string;
    displayName: string;
    email: string;
    role: string;
    isOwner: boolean;
  }>;
};

export function AdminNotificationComposer({ users }: AdminNotificationComposerProps) {
  const router = useRouter();
  const [audience, setAudience] = useState<"all" | "members" | "owners" | "admins" | "single">("all");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [actionHref, setActionHref] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");

        startTransition(async () => {
          const response = await fetch("/api/admin/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audience,
              userId,
              title,
              body,
              actionHref,
              actionLabel
            })
          });

          const payload = (await response.json()) as { error?: string; createdCount?: number };
          if (!response.ok) {
            setMessage(payload.error ?? "Could not send that message.");
            return;
          }

          setTitle("");
          setBody("");
          setUserId("");
          setActionHref("");
          setActionLabel("");
          setMessage(`Message sent to ${payload.createdCount ?? 0} inboxes.`);
          router.refresh();
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#111b2d]">Audience</span>
          <select
            className="w-full rounded-[18px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm text-[#111b2d] outline-none focus:border-[var(--accent)]"
            onChange={(event) =>
              setAudience(event.target.value as "all" | "members" | "owners" | "admins" | "single")
            }
            value={audience}
          >
            <option value="all">Everyone</option>
            <option value="members">Members</option>
            <option value="owners">Owners</option>
            <option value="admins">Admins</option>
            <option value="single">Single user</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#111b2d]">Title</span>
          <input
            className="w-full rounded-[18px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm text-[#111b2d] outline-none placeholder:text-[#7a8da4] focus:border-[var(--accent)]"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Happy new year from Addis Beakal"
            type="text"
            value={title}
          />
        </label>
      </div>

      {audience === "single" ? (
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#111b2d]">Choose user</span>
          <select
            className="w-full rounded-[18px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm text-[#111b2d] outline-none focus:border-[var(--accent)]"
            onChange={(event) => setUserId(event.target.value)}
            value={userId}
          >
            <option value="">Select one user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName} · {user.email}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-semibold text-[#111b2d]">Message</span>
        <textarea
          className="min-h-36 w-full rounded-[22px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm text-[#111b2d] outline-none placeholder:text-[#7a8da4] focus:border-[var(--accent)]"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Share an update, highlight a new listing, or warn users about something important."
          value={body}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#111b2d]">Action link</span>
          <input
            className="w-full rounded-[18px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm text-[#111b2d] outline-none placeholder:text-[#7a8da4] focus:border-[var(--accent)]"
            onChange={(event) => setActionHref(event.target.value)}
            placeholder="/discover"
            type="text"
            value={actionHref}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#111b2d]">Action label</span>
          <input
            className="w-full rounded-[18px] border border-[#d8e2ee] bg-white px-4 py-3 text-sm text-[#111b2d] outline-none placeholder:text-[#7a8da4] focus:border-[var(--accent)]"
            onChange={(event) => setActionLabel(event.target.value)}
            placeholder="Open update"
            type="text"
            value={actionLabel}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#66768c]">
          These messages land in the profile inbox and can point people to a useful page in the app.
        </p>
        <button
          className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          Send message
        </button>
      </div>

      {message ? <p className="text-sm text-[#66768c]">{message}</p> : null}
    </form>
  );
}
