import { cn } from "@/lib/utils";

type AdminStatusBadgeProps = {
  status: "pending" | "approved" | "rejected" | "suspended";
  label?: string;
};

const tone = {
  pending: "bg-[#fff4dc] text-[#c67a09]",
  approved: "bg-[#e8f7ef] text-[#1a7f57]",
  rejected: "bg-[#fff1ef] text-[#c55446]",
  suspended: "bg-[#eef3f9] text-[#73839a]"
} as const;

export function AdminStatusBadge({ status, label }: AdminStatusBadgeProps) {
  return (
    <span className={cn("rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]", tone[status])}>
      {label ?? status}
    </span>
  );
}
