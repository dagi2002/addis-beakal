"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminUserRoleFormProps = {
  userId: string;
  currentRole: "member" | "admin";
};

export function AdminUserRoleForm({ userId, currentRole }: AdminUserRoleFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateRole(role: "member" | "admin") {
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Could not update admin access.");
        return;
      }

      setMessage(role === "admin" ? "Admin access granted." : "Admin access removed.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {currentRole === "admin" ? (
        <button
          className="rounded-full border border-[#d8e2ee] bg-white px-4 py-2 text-sm font-semibold text-[#46576d] disabled:opacity-50"
          disabled={isPending}
          onClick={() => updateRole("member")}
          type="button"
        >
          Remove admin
        </button>
      ) : (
        <button
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={isPending}
          onClick={() => updateRole("admin")}
          type="button"
        >
          Grant admin
        </button>
      )}
      {message ? <p className="text-xs text-[#66768c]">{message}</p> : null}
    </div>
  );
}
