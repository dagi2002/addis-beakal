"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={className}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/auth/logout", {
            method: "POST"
          });

          router.push("/");
          router.refresh();
        });
      }}
      type="button"
    >
      Sign out
    </button>
  );
}
