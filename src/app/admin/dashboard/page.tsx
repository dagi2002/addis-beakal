import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminDashboardData } from "@/features/admin/service";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        actions={
          <>
            <Link className="rounded-full border border-[#dfe6f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#111b2d]" href="/admin/claims/pending">
              Review Pending
            </Link>
            <Link className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white" href="/admin/business/new">
              Add Business
            </Link>
          </>
        }
        breadcrumbs={[{ label: "Dashboard" }]}
        description="High-level summary of claim moderation, queue pressure, and the latest owner handoffs."
        title="Admin Dashboard"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard actionLabel="View pending" href="/admin/claims/pending" title="Total Claims" value={String(data.stats.total)} />
        <AdminStatCard actionLabel="Review now" href="/admin/claims/pending" title="Pending Review" value={String(data.stats.pending)} />
        <AdminStatCard href="/admin/claims/approved" title="Approved" value={String(data.stats.approved)} />
        <AdminStatCard href="/admin/claims/rejected" title="Rejected" value={String(data.stats.rejected)} />
        <AdminStatCard href="/admin/claims/suspended" title="Suspended" value={String(data.stats.suspended)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8ca1]">Operational signals</p>
              <h2 className="mt-3 font-[var(--font-heading)] text-3xl tracking-[-0.05em] text-[#111b2d]">Queue health</h2>
            </div>
            <Link className="text-sm font-semibold text-[var(--accent)]" href="/admin/tools">
              View All
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminStatCard title="Ownership Coverage" value={`${data.queueInsights.claimedBusinesses}/${data.queueInsights.totalBusinesses}`} />
            <AdminStatCard title="Oldest Pending" value={data.queueInsights.oldestPendingDays === null ? "Clear" : `${data.queueInsights.oldestPendingDays}d`} />
            <AdminStatCard title="Strongest Area" value={data.queueInsights.topNeighborhood?.name ?? "No area yet"} />
            <AdminStatCard title="Top Category" value={data.queueInsights.topCategory?.name ?? "No category yet"} />
          </div>
        </div>

        <div className="space-y-4 rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8ca1]">Recent activity</p>
              <h2 className="mt-3 font-[var(--font-heading)] text-3xl tracking-[-0.05em] text-[#111b2d]">Latest claim movement</h2>
            </div>
            <Link className="text-sm font-semibold text-[var(--accent)]" href="/admin/activity">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentActivity.map((claim) => (
              <Link
                key={claim.id}
                className="block rounded-[22px] border border-[#eef2f7] bg-[#fbfcfe] p-4 transition hover:border-[#dfe6f0]"
                href={`/admin/claims/${claim.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#111b2d]">{claim.business?.name ?? "Unknown business"}</p>
                    <p className="mt-1 text-sm text-[#66768c]">
                      {claim.claimantName} · {claim.neighborhood}
                    </p>
                  </div>
                  <AdminStatusBadge label={claim.statusLabel} status={claim.statusView} />
                </div>
                <p className="mt-3 text-sm text-[#7d8ca1]">{claim.activityTimestamp.slice(0, 10)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
