import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { getAdminManagementData } from "@/features/admin/service";

export default async function AdminManagementPage() {
  const data = await getAdminManagementData();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Admin" }
        ]}
        description="Admin visibility into workspace roles and moderation ownership."
        title="Admin Management"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <AdminStatCard title="Admins" value={String(data.adminCounts.admins)} />
        <AdminStatCard title="Members" value={String(data.adminCounts.members)} />
        <AdminStatCard title="Owned Listings" value={String(data.adminCounts.owners)} />
      </section>

      <section className="rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
        <h2 className="font-[var(--font-heading)] text-3xl tracking-[-0.05em] text-[#111b2d]">Workspace admins</h2>
        <div className="mt-6 space-y-3">
          {data.admins.map((admin) => (
            <div key={admin.id} className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcfe] px-4 py-4">
              <p className="font-semibold text-[#111b2d]">{admin.displayName}</p>
              <p className="mt-1 text-sm text-[#66768c]">{admin.email}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
