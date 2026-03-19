import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateBusinessForm } from "@/components/admin/create-business-form";
import { getAdminBusinessFormData } from "@/features/admin/service";

export default async function AdminBusinessNewPage() {
  const data = await getAdminBusinessFormData();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Add Business" }
        ]}
        description="Create a new listing or load an existing listing for editing."
        title="Business Editor"
      />

      <section className="rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
        <CreateBusinessForm
          categories={data.categories}
          existingBusinesses={data.existingBusinesses}
          neighborhoods={data.neighborhoods}
        />
      </section>
    </div>
  );
}
