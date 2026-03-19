"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminOwnershipAssignmentFormProps = {
  businesses: Array<{
    id: string;
    name: string;
    ownerUserId?: string;
    ownerName?: string | null;
  }>;
  users: Array<{
    id: string;
    displayName: string;
    email: string;
  }>;
  initialBusinessId?: string;
};

export function AdminOwnershipAssignmentForm({
  businesses,
  users,
  initialBusinessId
}: AdminOwnershipAssignmentFormProps) {
  const router = useRouter();
  const [businessId, setBusinessId] = useState(initialBusinessId ?? businesses[0]?.id ?? "");
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4 rounded-[24px] border border-black/8 bg-white/72 p-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-black/44">Ownership handoff</p>
        <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
          Assign a claimed business directly to a user. This is the fastest way to give owner access,
          including for `demo@addisbeakal.test`.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <select
          className="rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
          onChange={(event) => setBusinessId(event.target.value)}
          value={businessId}
        >
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
              {business.ownerName ? ` · owned by ${business.ownerName}` : ""}
            </option>
          ))}
        </select>
        <select
          className="rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
          onChange={(event) => setUserId(event.target.value)}
          value={userId}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.displayName} · {user.email}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs leading-5 text-[color:var(--ink-soft)]">
          After assignment, the user will automatically see the listing on the owner dashboard.
        </p>
        <button
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={isPending || !businessId || !userId}
          onClick={() => {
            setMessage("");
            startTransition(async () => {
              const response = await fetch("/api/admin/ownership", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, userId })
              });

              const payload = (await response.json()) as { error?: string };
              if (!response.ok) {
                setMessage(payload.error ?? "Could not assign owner.");
                return;
              }

              setMessage("Owner assigned.");
              router.refresh();
            });
          }}
          type="button"
        >
          Assign owner
        </button>
      </div>
      {message ? <p className="text-sm text-[color:var(--ink-soft)]">{message}</p> : null}
    </div>
  );
}
