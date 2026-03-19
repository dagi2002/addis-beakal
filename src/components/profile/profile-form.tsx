"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ProfileFormProps = {
  initialDisplayName: string;
};

export function ProfileForm({ initialDisplayName }: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");

        startTransition(async () => {
          const response = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayName })
          });

          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            setMessage(payload.error ?? "Could not update your profile.");
            return;
          }

          setMessage("Profile updated.");
          router.refresh();
        });
      }}
    >
      <input
        className="w-full rounded-[22px] border border-black/10 bg-white/80 px-4 py-3.5 text-[color:var(--surface-dark)] outline-none transition placeholder:text-black/35 focus:border-[color:var(--accent)]"
        onChange={(event) => setDisplayName(event.target.value)}
        type="text"
        value={displayName}
      />
      <button
        className="rounded-full bg-[color:var(--surface-dark)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        Save profile
      </button>
      {message ? <p className="text-sm text-[color:var(--ink-soft)]">{message}</p> : null}
    </form>
  );
}
