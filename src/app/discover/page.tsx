import Link from "next/link";

import { BusinessCard } from "@/components/business/business-card";
import { DiscoverFilters } from "@/components/business/discover-filters";
import { SiteShell } from "@/components/layout/site-shell";
import {
  BUSINESS_FEATURE_OPTIONS,
  PRICE_TIER_OPTIONS,
  formatBusinessFeatureLabel
} from "@/features/businesses/catalog";
import { getDiscoverPageData } from "@/features/discovery/service";
import type { DiscoverFilters as DiscoverFilterValues } from "@/features/businesses/types";
import { getViewerId } from "@/lib/viewer";

type DiscoverPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const categoryEmojis: Record<string, string> = {
  cafes: "☕",
  restaurants: "🍛",
  hotels: "🏨",
  salons: "💇",
  barbers: "✂️",
  gyms: "💪",
  clinics: "🏥",
  pharmacy: "💊",
  bakeries: "🍞",
  bars: "🍸",
  spas: "🧖",
  "car-services": "🚗"
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

function getRatingParam(value: string | undefined) {
  const parsed = Number(value);
  return [3, 3.5, 4, 4.5].includes(parsed) ? parsed : undefined;
}

function getSearchValues(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function buildDiscoverHref(
  current: DiscoverFilterValues,
  updates: Partial<DiscoverFilterValues>
) {
  const next = {
    query: current.query ?? "",
    category: current.category ?? "",
    neighborhood: current.neighborhood ?? "",
    minRating: current.minRating,
    priceTiers: current.priceTiers ?? [],
    features: current.features ?? [],
    sort: current.sort ?? "recommended",
    ...updates
  };

  const params = new URLSearchParams();

  if (next.query) params.set("query", next.query);
  if (next.category) params.set("category", next.category);
  if (next.neighborhood) params.set("neighborhood", next.neighborhood);
  if (next.minRating) params.set("minRating", String(next.minRating));
  next.priceTiers?.forEach((priceTier) => params.append("price", priceTier));
  next.features?.forEach((feature) => params.append("feature", feature));
  if (next.sort && next.sort !== "recommended") params.set("sort", next.sort);

  const queryString = params.toString();
  return queryString ? `/discover?${queryString}` : "/discover";
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = (await searchParams) ?? {};
  const viewerId = await getViewerId();
  const filters: DiscoverFilterValues = {
    query: getSearchParam(params.query),
    category: getSearchParam(params.category),
    neighborhood: getSearchParam(params.neighborhood),
    minRating: getRatingParam(getSearchParam(params.minRating)),
    priceTiers: getSearchValues(params.price),
    features: getSearchValues(params.feature),
    sort: getSortParam(getSearchParam(params.sort))
  };

  const data = await getDiscoverPageData(filters, viewerId);
  const hasActiveSearch =
    Boolean(filters.query?.trim()) ||
    Boolean(filters.category) ||
    Boolean(filters.neighborhood) ||
    Boolean(filters.minRating) ||
    (filters.priceTiers?.length ?? 0) > 0 ||
    (filters.features?.length ?? 0) > 0 ||
    Boolean(filters.sort && filters.sort !== "recommended");

  const ratingOptions = [3, 3.5, 4, 4.5] as const;
  const priceOptions = PRICE_TIER_OPTIONS;
  const featureOptions = BUSINESS_FEATURE_OPTIONS;

  function toggleValue(values: string[], value: string) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }

  return (
    <SiteShell className="pb-0 pt-4" compactMain>
      <section className="space-y-8">
        <DiscoverFilters
          categories={data.categories}
          defaults={data.activeFilters}
          neighborhoods={data.neighborhoods}
        />

        <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="rounded-[30px] border border-[#e8edf4] bg-white p-6 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
            <div className="border-b border-[#eef2f7] pb-5">
              <p className="text-2xl font-semibold tracking-[-0.04em] text-[#1b2433]">Filters</p>
            </div>

            <div className="space-y-8 pt-6">
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6a7890]">Category</p>
                <div className="space-y-2">
                  <Link
                    className={`block rounded-[16px] px-3 py-2 text-sm transition ${
                      !data.activeFilters.category ? "bg-[#fff4e5] font-semibold text-[#ef8b11]" : "text-[#49576d] hover:bg-[#f7f9fc]"
                    }`}
                    href={buildDiscoverHref(data.activeFilters, { category: "" })}
                  >
                    All categories
                  </Link>
                  {data.categories.map((category) => (
                    <Link
                      key={category.id}
                      className={`block rounded-[16px] px-3 py-2 text-sm transition ${
                        data.activeFilters.category === category.slug
                          ? "bg-[#fff4e5] font-semibold text-[#ef8b11]"
                          : "text-[#49576d] hover:bg-[#f7f9fc]"
                      }`}
                      href={buildDiscoverHref(data.activeFilters, { category: category.slug })}
                    >
                      <span className="mr-2">{categoryEmojis[category.slug] ?? "•"}</span>
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6a7890]">Area</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className={`rounded-[16px] border px-3 py-2 text-sm transition ${
                      !data.activeFilters.neighborhood
                        ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]"
                        : "border-[#dfe6f0] text-[#55657b] hover:bg-[#f7f9fc]"
                    }`}
                    href={buildDiscoverHref(data.activeFilters, { neighborhood: "" })}
                  >
                    All
                  </Link>
                  {data.neighborhoods.map((neighborhood) => (
                    <Link
                      key={neighborhood.id}
                      className={`rounded-[16px] border px-3 py-2 text-sm transition ${
                        data.activeFilters.neighborhood === neighborhood.slug
                          ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]"
                          : "border-[#dfe6f0] text-[#55657b] hover:bg-[#f7f9fc]"
                      }`}
                      href={buildDiscoverHref(data.activeFilters, { neighborhood: neighborhood.slug })}
                    >
                      {neighborhood.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-[#eef2f7] pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6a7890]">Minimum Rating</p>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <Link
                    className={`rounded-[16px] border px-3 py-2 text-sm transition ${
                      !data.activeFilters.minRating
                        ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]"
                        : "border-[#dfe6f0] text-[#55657b] hover:bg-[#f7f9fc]"
                    }`}
                    href={buildDiscoverHref(data.activeFilters, { minRating: undefined })}
                  >
                    Any
                  </Link>
                  {ratingOptions.map((rating) => (
                    <Link
                      key={rating}
                      className={`rounded-[16px] border px-3 py-2 text-sm transition ${
                        data.activeFilters.minRating === rating
                          ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]"
                          : "border-[#dfe6f0] text-[#55657b] hover:bg-[#f7f9fc]"
                      }`}
                      href={buildDiscoverHref(data.activeFilters, { minRating: rating })}
                    >
                      ⭐ {rating.toFixed(1)}+
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-[#eef2f7] pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6a7890]">Price Range</p>
                <div className="grid gap-2">
                  {priceOptions.map((option) => (
                    <Link
                      key={option.value}
                      className={`rounded-[16px] border px-3 py-2 text-sm transition ${
                        data.activeFilters.priceTiers.includes(option.value)
                          ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]"
                          : "border-[#dfe6f0] text-[#55657b] hover:bg-[#f7f9fc]"
                      }`}
                      href={buildDiscoverHref(data.activeFilters, {
                        priceTiers: toggleValue(data.activeFilters.priceTiers, option.value)
                      })}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-[#eef2f7] pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6a7890]">Features</p>
                <div className="flex flex-wrap gap-2">
                  {featureOptions.map((feature) => (
                    <Link
                      key={feature}
                      className={`rounded-[16px] border px-3 py-2 text-sm transition ${
                        data.activeFilters.features.includes(feature)
                          ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]"
                          : "border-[#dfe6f0] text-[#55657b] hover:bg-[#f7f9fc]"
                      }`}
                      href={buildDiscoverHref(data.activeFilters, {
                        features: toggleValue(data.activeFilters.features, feature)
                      })}
                    >
                      {formatBusinessFeatureLabel(feature)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6a7890]">
                {hasActiveSearch ? "Results" : "Explore"}
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#18212f]">
                {data.businesses.length} {hasActiveSearch ? "businesses found" : "businesses available"}
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {data.businesses.map((business, index) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  featured={index < 2}
                  variant="market"
                />
              ))}
            </div>

            {data.businesses.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-[#d9e2ee] bg-white p-10 text-center text-[#66758b]">
                No businesses matched those filters. Try widening the area or switching the sort.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
