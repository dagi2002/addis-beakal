"use client";

import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { Category, DiscoverSort, Neighborhood } from "@/features/businesses/types";
import { cn } from "@/lib/utils";

type DiscoverFiltersProps = {
  categories: Category[];
  neighborhoods: Neighborhood[];
  defaults: {
    query: string;
    category: string;
    neighborhood: string;
    minRating?: number;
    priceTiers: string[];
    features: string[];
    sort: DiscoverSort;
  };
};

const MIN_RATING_OPTIONS = [3, 3.5, 4, 4.5] as const;
const PRICE_OPTIONS = [
  { value: "$", label: "Under 100 ETB" },
  { value: "$$", label: "100-300 ETB" },
  { value: "$$$", label: "300-600 ETB" },
  { value: "$$$$", label: "600+ ETB" }
] as const;
const FEATURE_OPTIONS = [
  "great coffee",
  "fasting friendly",
  "halal",
  "live music",
  "rooftop",
  "parking",
  "delivery",
  "strong wifi",
  "outdoor seating",
  "family friendly",
  "affordable"
] as const;

export function DiscoverFilters({
  categories,
  neighborhoods,
  defaults
}: DiscoverFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(defaults.query);
  const [category, setCategory] = useState(defaults.category);
  const [neighborhood, setNeighborhood] = useState(defaults.neighborhood);
  const [minRating, setMinRating] = useState<number | undefined>(defaults.minRating);
  const [priceTiers, setPriceTiers] = useState<string[]>(defaults.priceTiers);
  const [features, setFeatures] = useState<string[]>(defaults.features);
  const [sort, setSort] = useState<DiscoverSort>(defaults.sort);
  const activeFilterCount =
    [query, category, neighborhood, minRating ? String(minRating) : ""].filter(Boolean).length +
    priceTiers.length +
    features.length +
    (sort !== "recommended" ? 1 : 0);

  function toggleArrayValue(values: string[], value: string) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }

  function applyFilters() {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (query) nextParams.set("query", query);
    else nextParams.delete("query");

    if (category) nextParams.set("category", category);
    else nextParams.delete("category");

    if (neighborhood) nextParams.set("neighborhood", neighborhood);
    else nextParams.delete("neighborhood");

    if (minRating) nextParams.set("minRating", String(minRating));
    else nextParams.delete("minRating");

    nextParams.delete("price");
    priceTiers.forEach((priceTier) => nextParams.append("price", priceTier));

    nextParams.delete("feature");
    features.forEach((feature) => nextParams.append("feature", feature));

    if (sort) nextParams.set("sort", sort);
    else nextParams.delete("sort");

    router.replace(`/discover?${nextParams.toString()}`);
    setOpen(false);
  }

  function resetFilters() {
    setQuery("");
    setCategory("");
    setNeighborhood("");
    setMinRating(undefined);
    setPriceTiers([]);
    setFeatures([]);
    setSort("recommended");
    router.replace("/discover");
    setOpen(false);
  }

  return (
    <>
      <div className="glass-panel rounded-[30px] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:hidden">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--surface-dark)] px-4 py-3 text-sm font-medium text-white"
            onClick={() => setOpen(true)}
            type="button"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Sort & filter
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-white/20 px-2 py-1 text-xs">{activeFilterCount}</span>
            ) : null}
          </button>
          <div className="flex items-center gap-2 rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm text-[var(--muted)]">
            <Search className="h-4 w-4" />
            <span>{query || "Search businesses, categories, neighborhoods"}</span>
          </div>
        </div>

        <div className="hidden gap-4 lg:block">
          <div className="grid gap-3 rounded-[28px] border border-[rgba(62,46,31,0.1)] bg-white p-3 shadow-[0_24px_60px_rgba(65,45,28,0.12)] lg:grid-cols-[minmax(0,1.8fr)_220px_210px_130px]">
            <label className="flex items-center gap-3 rounded-[20px] bg-[var(--background-strong)] px-4 py-3.5 text-sm text-[var(--muted)]">
              <Search className="h-4 w-4 text-[var(--accent)]" />
              <input
                className="w-full bg-transparent text-[color:var(--surface-dark)] outline-none placeholder:text-[var(--muted)]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Addis businesses"
                value={query}
              />
            </label>
            <label className="flex items-center gap-3 rounded-[20px] bg-[var(--background-strong)] px-4 py-3.5 text-sm text-[var(--muted)]">
              <MapPin className="h-4 w-4 text-[var(--accent)]" />
              <select
                className="w-full bg-transparent text-[color:var(--surface-dark)] outline-none"
                onChange={(event) => setNeighborhood(event.target.value)}
                value={neighborhood}
              >
                <option value="">All neighborhoods</option>
                {neighborhoods.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <select
              className="rounded-[20px] bg-[var(--background-strong)] px-4 py-3.5 text-sm text-[color:var(--surface-dark)] outline-none"
              onChange={(event) => setSort(event.target.value as DiscoverSort)}
              value={sort}
            >
              <option value="recommended">Recommended</option>
              <option value="top-rated">Top rated</option>
              <option value="most-reviewed">Most reviewed</option>
              <option value="most-saved">Most saved</option>
            </select>
            <button
              className="rounded-[20px] bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
              onClick={applyFilters}
              type="button"
            >
              Search
            </button>
          </div>
        </div>

      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 p-4 transition lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="glass-panel ml-auto h-full w-full max-w-md rounded-[32px] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-heading)] text-[1.7rem] tracking-[-0.04em]">Refine results</h2>
            <button className="text-sm text-[var(--muted)]" onClick={() => setOpen(false)} type="button">
              Close
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Search, sort, and neighborhood filters stay grouped here so mobile discovery feels fast rather than cramped.
          </p>
          <div className="mt-5 space-y-4">
            <input
              className="w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              value={query}
            />
            <select
              className="w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]"
              onChange={(event) => setNeighborhood(event.target.value)}
              value={neighborhood}
            >
              <option value="">All neighborhoods</option>
              {neighborhoods.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Minimum rating</p>
              <div className="flex flex-wrap gap-2">
                <button
                  className={cn(
                    "rounded-[16px] border px-3 py-2 text-sm",
                    !minRating ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]" : "border-[var(--border)]"
                  )}
                  onClick={() => setMinRating(undefined)}
                  type="button"
                >
                  Any
                </button>
                {MIN_RATING_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={cn(
                      "rounded-[16px] border px-3 py-2 text-sm",
                      minRating === option ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]" : "border-[var(--border)]"
                    )}
                    onClick={() => setMinRating(option)}
                    type="button"
                  >
                    ⭐ {option.toFixed(1)}+
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Price range</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "rounded-[16px] border px-3 py-2 text-sm",
                      priceTiers.includes(option.value) ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]" : "border-[var(--border)]"
                    )}
                    onClick={() => setPriceTiers((current) => toggleArrayValue(current, option.value))}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Features</p>
              <div className="flex flex-wrap gap-2">
                {FEATURE_OPTIONS.map((feature) => (
                  <button
                    key={feature}
                    className={cn(
                      "rounded-[16px] border px-3 py-2 text-sm",
                      features.includes(feature) ? "border-[#ffb24a] bg-[#fff4e5] font-semibold text-[#ef8b11]" : "border-[var(--border)]"
                    )}
                    onClick={() => setFeatures((current) => toggleArrayValue(current, feature))}
                    type="button"
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
            <select
              className="w-full rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]"
              onChange={(event) => setSort(event.target.value as DiscoverSort)}
              value={sort}
            >
              <option value="recommended">Recommended</option>
              <option value="top-rated">Top rated</option>
              <option value="most-reviewed">Most reviewed</option>
              <option value="most-saved">Most saved</option>
            </select>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              className="flex-1 rounded-[22px] border border-[var(--border)] px-4 py-3"
              onClick={resetFilters}
              type="button"
            >
              Reset
            </button>
            <button
              className="flex-1 rounded-[22px] bg-[var(--accent)] px-4 py-3 font-bold text-white"
              onClick={applyFilters}
              type="button"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
