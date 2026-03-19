import { AdminClaimsListScreen } from "@/components/admin/admin-claims-list-screen";
import { getAdminClaimsListData } from "@/features/admin/service";

type ClaimsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminApprovedClaimsPage({ searchParams }: ClaimsPageProps) {
  const params = (await searchParams) ?? {};
  const data = await getAdminClaimsListData({
    view: "approved",
    query: getSearchParam(params.q),
    page: Number(getSearchParam(params.page)) || 1
  });

  return (
    <AdminClaimsListScreen
      basePath="/admin/claims/approved"
      claims={data.items}
      currentPage={data.currentPage}
      currentView="approved"
      description="Approved ownership handoffs and verified claim outcomes."
      query={data.query}
      title="Approved Claims"
      totalItems={data.totalItems}
      totalPages={data.totalPages}
    />
  );
}
