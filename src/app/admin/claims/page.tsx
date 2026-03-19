import { AdminClaimsListScreen } from "@/components/admin/admin-claims-list-screen";
import { getAdminClaimsListData } from "@/features/admin/service";

type ClaimsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminClaimsPage({ searchParams }: ClaimsPageProps) {
  const params = (await searchParams) ?? {};
  const data = await getAdminClaimsListData({
    view: "all",
    query: getSearchParam(params.q),
    page: Number(getSearchParam(params.page)) || 1
  });

  return (
    <AdminClaimsListScreen
      basePath="/admin/claims"
      claims={data.items}
      currentPage={data.currentPage}
      currentView="all"
      description="Search and scan every claim in one place, then open the detail page to act on it."
      query={data.query}
      title="All Claims"
      totalItems={data.totalItems}
      totalPages={data.totalPages}
    />
  );
}
