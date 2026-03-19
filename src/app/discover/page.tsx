import { BusinessCard } from "@/components/business/business-card";
import { DiscoverFilters } from "@/components/business/discover-filters";
import { SiteShell } from "@/components/layout/site-shell";
import { getDiscoverPageData } from "@/features/discovery/service";
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
    <SiteShell className="pb-0 pt-4" compactMain showHeaderSearch>
      <section className="dark-panel overflow-hidden rounded-[40px] px-6 py-8 text-white lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-4">
            <p className="section-label text-[#f3bf74]">Explore Addis</p>
            <h1 className="page-title max-w-4xl text-white">
              Search with more texture,
              <br />
              fewer dead ends,
              <br />
              and better context.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/66">
              The discovery layer now leans into neighborhood mood, category intent, and stronger
              ranking cues so exploring Addis feels less like filtering a spreadsheet.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Results", data.businesses.length.toString()],
              ["Categories", data.categories.length.toString()],
              ["Neighborhoods", data.neighborhoods.length.toString()]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/46">{label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <DiscoverFilters
          categories={data.categories}
          defaults={data.activeFilters}
          neighborhoods={data.neighborhoods}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">Discovery results</p>
            <h2 className="editorial-title mt-3">Places worth a closer look.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            Results are ranked to surface businesses with stronger signals across ratings, review
            volume, and saves while still letting you pivot by category and neighborhood.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {data.businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {data.businesses.length === 0 ? (
          <div className="glass-panel rounded-[30px] border-dashed p-10 text-center text-[var(--muted)]">
            No businesses matched those filters. Try widening the neighborhood or switching the sort.
          </div>
        ) : null}
      </section>
    </SiteShell>
  );
}
