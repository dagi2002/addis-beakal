import { AdminClaimsListScreen } from "@/components/admin/admin-claims-list-screen";
import { getAdminClaimsListData } from "@/features/admin/service";

type ClaimsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminSuspendedClaimsPage({ searchParams }: ClaimsPageProps) {
  const params = (await searchParams) ?? {};
  const data = await getAdminClaimsListData({
    view: "suspended",
    query: getSearchParam(params.q),
    page: Number(getSearchParam(params.page)) || 1
  });

  return (
    <AdminClaimsListScreen
      basePath="/admin/claims/suspended"
      claims={data.items}
      currentPage={data.currentPage}
      currentView="suspended"
      description="Claims automatically displaced by another approved ownership decision."
      query={data.query}
      title="Suspended Claims"
      totalItems={data.totalItems}
      totalPages={data.totalPages}
    />
  );
}
