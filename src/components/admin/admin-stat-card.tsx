import Link from "next/link";

type AdminStatCardProps = {
  title: string;
  value: string;
  caption?: string;
  href?: string;
  actionLabel?: string;
};

export function AdminStatCard({
  title,
  value,
  caption,
  href,
  actionLabel = "View all"
}: AdminStatCardProps) {
  return (
    <article className="rounded-[28px] border border-[#e6ebf2] bg-white p-5 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8ca1]">{title}</p>
      <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111b2d]">{value}</p>
      {caption ? <p className="mt-2 text-sm text-[#66768c]">{caption}</p> : null}
      {href ? (
        <div className="mt-4">
          <Link className="text-sm font-semibold text-[var(--accent)]" href={href}>
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
