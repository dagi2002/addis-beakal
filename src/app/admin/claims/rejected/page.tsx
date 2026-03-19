import { AdminClaimsListScreen } from "@/components/admin/admin-claims-list-screen";
import { getAdminClaimsListData } from "@/features/admin/service";

type ClaimsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminRejectedClaimsPage({ searchParams }: ClaimsPageProps) {
  const params = (await searchParams) ?? {};
  const data = await getAdminClaimsListData({
    view: "rejected",
    query: getSearchParam(params.q),
    page: Number(getSearchParam(params.page)) || 1
  });

  return (
    <AdminClaimsListScreen
      basePath="/admin/claims/rejected"
      claims={data.items}
      currentPage={data.currentPage}
      currentView="rejected"
      description="Rejected claims and the evidence trail behind those moderation decisions."
      query={data.query}
      title="Rejected Claims"
      totalItems={data.totalItems}
      totalPages={data.totalPages}
    />
  );
}
