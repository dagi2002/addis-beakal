import Link from "next/link";

import type { AdminClaimView } from "@/features/admin/service";
import { AdminClaimsTabs } from "@/components/admin/admin-claims-tabs";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminTable } from "@/components/admin/admin-table";

type AdminClaimsListScreenProps = {
  title: string;
  description: string;
  currentView: AdminClaimView;
  basePath: string;
  query: string;
  claims: Array<{
    id: string;
    business?: { name: string } | null;
    claimantName: string;
    neighborhood: string;
    category: string;
    createdAt: string;
    statusView: "pending" | "approved" | "rejected" | "suspended";
    statusLabel: string;
  }>;
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export function AdminClaimsListScreen({
  title,
  description,
  currentView,
  basePath,
  query,
  claims,
  currentPage,
  totalPages,
  totalItems
}: AdminClaimsListScreenProps) {
  function buildHref(page: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (page > 1) params.set("page", String(page));

    return params.toString() ? `${basePath}?${params.toString()}` : basePath;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Claims" }
        ]}
        description={description}
        title={title}
      />

      <div className="flex flex-col gap-4 rounded-[28px] border border-[#e6ebf2] bg-white p-5 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminClaimsTabs current={currentView} />
          <form action={basePath} className="flex gap-3">
            <input
              className="min-w-[260px] rounded-full border border-[#dfe6f0] bg-[#f8fafc] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
              defaultValue={query}
              name="q"
              placeholder="Search business, claimant, area"
              type="search"
            />
            <button
              className="rounded-full bg-[#111b2d] px-4 py-2.5 text-sm font-semibold text-white"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>
        <p className="text-sm text-[#66768c]">{totalItems} claims</p>
      </div>

      <AdminTable
        columns={["Claim", "Claimant", "Area", "Status", "Created"]}
        emptyState={<div className="p-10 text-center text-sm text-[#66768c]">No claims matched this view.</div>}
        hasRows={claims.length > 0}
      >
        {claims.map((claim) => (
          <Link
            key={claim.id}
            className="grid grid-cols-5 gap-4 px-5 py-4 text-sm text-[#55657b] transition hover:bg-[#fbfcfe]"
            href={`/admin/claims/${claim.id}`}
          >
            <div>
              <p className="font-semibold text-[#111b2d]">{claim.business?.name ?? "Unknown business"}</p>
              <p className="mt-1 text-xs text-[#7d8ca1]">{claim.category}</p>
            </div>
            <div className="font-medium text-[#111b2d]">{claim.claimantName}</div>
            <div>{claim.neighborhood}</div>
            <div>
              <AdminStatusBadge label={claim.statusLabel} status={claim.statusView} />
            </div>
            <div>{claim.createdAt.slice(0, 10)}</div>
          </Link>
        ))}
      </AdminTable>

      <AdminPagination buildHref={buildHref} currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
