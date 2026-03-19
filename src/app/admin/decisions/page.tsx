import Link from "next/link";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminDecisionsData } from "@/features/admin/service";

type DecisionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminDecisionsPage({ searchParams }: DecisionsPageProps) {
  const params = (await searchParams) ?? {};
  const query = getSearchParam(params.q);
  const status = getSearchParam(params.status) as "approved" | "rejected" | "suspended" | undefined;
  const page = Number(getSearchParam(params.page)) || 1;
  const data = await getAdminDecisionsData({ query, status, page });

  function buildHref(nextPage: number) {
    const nextParams = new URLSearchParams();
    if (data.query) nextParams.set("q", data.query);
    if (data.status) nextParams.set("status", data.status);
    if (nextPage > 1) nextParams.set("page", String(nextPage));
    return nextParams.toString() ? `/admin/decisions?${nextParams.toString()}` : "/admin/decisions";
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Decisions" }
        ]}
        description="Reviewed claim history with reviewers, timestamps, and outcomes."
        title="Recent Decisions"
      />

      <div className="flex flex-col gap-4 rounded-[28px] border border-[#e6ebf2] bg-white p-5 shadow-[0_14px_36px_rgba(34,51,84,0.06)] lg:flex-row lg:items-center lg:justify-between">
        <form action="/admin/decisions" className="flex flex-wrap gap-3">
          <input
            className="min-w-[260px] rounded-full border border-[#dfe6f0] bg-[#f8fafc] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
            defaultValue={data.query}
            name="q"
            placeholder="Search decisions"
            type="search"
          />
          <select
            className="rounded-full border border-[#dfe6f0] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
            defaultValue={data.status}
            name="status"
          >
            <option value="">All outcomes</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="rounded-full bg-[#111b2d] px-4 py-2.5 text-sm font-semibold text-white" type="submit">
            Filter
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {data.items.map((claim) => (
          <Link
            key={claim.id}
            className="block rounded-[28px] border border-[#e6ebf2] bg-white p-5 shadow-[0_14px_36px_rgba(34,51,84,0.06)] transition hover:border-[#dfe6f0]"
            href={`/admin/claims/${claim.id}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[#111b2d]">{claim.business?.name ?? "Unknown business"}</p>
                <p className="mt-2 text-sm text-[#66768c]">
                  {claim.claimantName} · reviewed by {claim.reviewer?.displayName ?? "Unknown reviewer"}
                </p>
              </div>
              <AdminStatusBadge label={claim.statusLabel} status={claim.statusView} />
            </div>
            <p className="mt-4 text-sm text-[#7d8ca1]">{claim.reviewedAt?.slice(0, 10) ?? claim.activityTimestamp.slice(0, 10)}</p>
          </Link>
        ))}
      </div>

      <AdminPagination buildHref={buildHref} currentPage={data.currentPage} totalPages={data.totalPages} />
    </div>
  );
}
