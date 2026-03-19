import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateBusinessForm } from "@/components/admin/create-business-form";
import { getAdminBusinessFormData } from "@/features/admin/service";

type AdminBusinessNewPageProps = {
  searchParams?: Promise<{ businessId?: string }>;
};

export default async function AdminBusinessNewPage({ searchParams }: AdminBusinessNewPageProps) {
  const params = (await searchParams) ?? {};
  const data = await getAdminBusinessFormData();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: params.businessId ? "Edit Business" : "Add Business" }
        ]}
        description="Create a new listing or load any existing business in the system for editing."
        title="Business Editor"
      />

      <section className="rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
        <CreateBusinessForm
          categories={data.categories}
          existingBusinesses={data.existingBusinesses}
          initialBusinessId={params.businessId}
          neighborhoods={data.neighborhoods}
        />
      </section>
    </div>
  );
}
