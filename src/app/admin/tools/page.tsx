import Link from "next/link";

import { AdminOwnershipAssignmentForm } from "@/components/admin/admin-ownership-assignment-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { getAdminToolsData } from "@/features/admin/service";

export default async function AdminToolsPage() {
  const data = await getAdminToolsData();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Tools" }
        ]}
        description="Operational signals and listing-side admin tools."
        title="Business Tools"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard caption="Verified owner profiles attached." title="Ownership Coverage" value={`${data.queueInsights.claimedBusinesses}/${data.queueInsights.totalBusinesses}`} />
        <AdminStatCard caption="Listings still waiting for owner handoff." title="Unowned Listings" value={String(data.queueInsights.unownedBusinesses)} />
        <AdminStatCard caption="Highest claim pressure area." title="Strongest Area" value={data.queueInsights.topNeighborhood?.name ?? "No area yet"} />
        <AdminStatCard caption="Most claimed category so far." title="Top Category" value={data.queueInsights.topCategory?.name ?? "No category yet"} />
      </section>

      <section className="rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[var(--font-heading)] text-3xl tracking-[-0.05em] text-[#111b2d]">Listing editor</h2>
            <p className="mt-2 text-sm text-[#66768c]">
              Every business in the system can be opened in edit mode from here, including older seeded listings and newly added ones.
            </p>
          </div>
          <Link
            className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
            href="/admin/business/new"
          >
            Add new listing
          </Link>
        </div>
        <div className="mt-6 space-y-3">
          {data.allBusinesses.length > 0 ? (
            data.allBusinesses.map((business) => (
              <div key={business.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#eef2f7] bg-[#fbfcfe] px-4 py-4">
                <div>
                  <p className="font-semibold text-[#111b2d]">{business.name}</p>
                  <p className="mt-1 text-sm text-[#66768c]">
                    {business.categoryName} · {business.neighborhoodName}
                  </p>
                  <p className="mt-1 text-sm text-[#66768c]">
                    {business.featureCount} features · {business.photoCount} photos
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#7d8ca1]">
                    {business.ownerName ? `Owner: ${business.ownerName}` : "Unowned"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-[#7d8ca1]">
                    {business.createdAt ? business.createdAt.slice(0, 10) : "Existing listing"}
                  </p>
                  <Link
                    className="rounded-full border border-[#d8e2ee] bg-white px-4 py-2 text-sm font-semibold text-[#111b2d]"
                    href={`/admin/business/new?businessId=${business.id}`}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#66768c]">No businesses available yet.</p>
          )}
        </div>
      </section>

      <AdminOwnershipAssignmentForm businesses={data.businesses} users={data.users} />
    </div>
  );
}
