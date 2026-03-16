import { BusinessCard } from "@/components/business/business-card";
import { DiscoverFilters } from "@/components/business/discover-filters";
import { SiteShell } from "@/components/layout/site-shell";
import { getDiscoverPageData } from "@/features/businesses/service";
import type { DiscoverFilters as DiscoverFilterValues } from "@/features/businesses/types";
import { getViewerId } from "@/lib/viewer";

type DiscoverPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSortParam(value: string | undefined): DiscoverFilterValues["sort"] {
  if (
    value === "recommended" ||
    value === "top-rated" ||
    value === "most-reviewed" ||
    value === "most-saved"
  ) {
    return value;
  }

  return undefined;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = (await searchParams) ?? {};
  const viewerId = await getViewerId();
  const filters: DiscoverFilterValues = {
    query: getSearchParam(params.query),
    category: getSearchParam(params.category),
    neighborhood: getSearchParam(params.neighborhood),
    sort: getSortParam(getSearchParam(params.sort))
  };

  const data = await getDiscoverPageData(filters, viewerId);

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Discover businesses</p>
          <h1 className="font-[var(--font-heading)] text-4xl tracking-tight">Designed for quick mobile discovery and strong public trust.</h1>
          <p className="max-w-3xl text-base leading-7 text-black/65">
            Filters are tuned for mobile first, ratings exclude non-public reviews, and saved counts stay synchronized when users save or unsave.
          </p>
        </div>

        <DiscoverFilters
          categories={data.categories}
          defaults={data.activeFilters}
          neighborhoods={data.neighborhoods}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {data.businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {data.businesses.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-black/10 bg-white/60 p-8 text-center text-black/60">
            No businesses matched those filters. Try clearing one of the mobile filters or broadening your query.
          </div>
        ) : null}
      </section>
    </SiteShell>
  );
}
