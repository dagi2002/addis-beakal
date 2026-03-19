import { AdminClaimsListScreen } from "@/components/admin/admin-claims-list-screen";
import { getAdminClaimsListData } from "@/features/admin/service";

type ClaimsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPendingClaimsPage({ searchParams }: ClaimsPageProps) {
  const params = (await searchParams) ?? {};
  const data = await getAdminClaimsListData({
    view: "pending",
    query: getSearchParam(params.q),
    page: Number(getSearchParam(params.page)) || 1
  });

  return (
    <AdminClaimsListScreen
      basePath="/admin/claims/pending"
      claims={data.items}
      currentPage={data.currentPage}
      currentView="pending"
      description="Claims waiting on a real moderation decision."
      query={data.query}
      title="Pending Review"
      totalItems={data.totalItems}
      totalPages={data.totalPages}
    />
  );
}
