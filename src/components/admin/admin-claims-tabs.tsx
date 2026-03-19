import Link from "next/link";

import { cn } from "@/lib/utils";

type AdminClaimsTabsProps = {
  current: "all" | "pending" | "approved" | "rejected" | "suspended";
};

const tabItems = [
  { href: "/admin/claims", key: "all", label: "All" },
  { href: "/admin/claims/pending", key: "pending", label: "Pending Review" },
  { href: "/admin/claims/approved", key: "approved", label: "Approved" },
  { href: "/admin/claims/rejected", key: "rejected", label: "Rejected" },
  { href: "/admin/claims/suspended", key: "suspended", label: "Suspended" }
] as const;

export function AdminClaimsTabs({ current }: AdminClaimsTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabItems.map((tab) => (
        <Link
          key={tab.href}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition",
            current === tab.key
              ? "border-[#ffb24a] bg-[#fff4e5] text-[#ef8b11]"
              : "border-[#dfe6f0] bg-white text-[#55657b] hover:bg-[#f7f9fc]"
          )}
          href={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
