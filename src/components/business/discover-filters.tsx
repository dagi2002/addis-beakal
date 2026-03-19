"use client";

import { Search, SlidersHorizontal } from "lucide-react";
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
    sort: DiscoverSort;
  };
};

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
  const [sort, setSort] = useState<DiscoverSort>(defaults.sort);
  const activeFilterCount = [query, category, neighborhood].filter(Boolean).length + (sort !== "recommended" ? 1 : 0);

  function applyFilters() {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (query) nextParams.set("query", query);
    else nextParams.delete("query");

    if (category) nextParams.set("category", category);
    else nextParams.delete("category");

    if (neighborhood) nextParams.set("neighborhood", neighborhood);
    else nextParams.delete("neighborhood");

    if (sort) nextParams.set("sort", sort);
    else nextParams.delete("sort");

    router.replace(`/discover?${nextParams.toString()}`);
    setOpen(false);
  }

  function resetFilters() {
    setQuery("");
    setCategory("");
    setNeighborhood("");
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
          <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.68)] px-4 py-3 text-sm text-[var(--muted)]">
            <Search className="h-4 w-4" />
            <span>{query || "Search businesses, categories, neighborhoods"}</span>
          </div>
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-[1.4fr_0.95fr_0.95fr_1.1fr]">
          <input
            className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search businesses, categories, neighborhoods"
            value={query}
          />
          <select
            className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]"
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
            className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]"
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
          <div className="flex gap-3">
            <select
              className="min-w-0 flex-1 rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3.5 outline-none transition focus:border-[var(--accent)]"
              onChange={(event) => setSort(event.target.value as DiscoverSort)}
              value={sort}
            >
              <option value="recommended">Recommended</option>
              <option value="top-rated">Top rated</option>
              <option value="most-reviewed">Most reviewed</option>
              <option value="most-saved">Most saved</option>
            </select>
            <button
              className="rounded-[22px] bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
              onClick={applyFilters}
              type="button"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {query ? <span className="rounded-full border border-[rgba(62,46,31,0.1)] bg-[rgba(255,255,255,0.6)] px-3 py-2 text-xs text-[var(--muted-strong)]">Query: {query}</span> : null}
          {category ? (
            <span className="rounded-full border border-[rgba(62,46,31,0.1)] bg-[rgba(255,255,255,0.6)] px-3 py-2 text-xs text-[var(--muted-strong)]">
              Category: {categories.find((item) => item.slug === category)?.name ?? category}
            </span>
          ) : null}
          {neighborhood ? (
            <span className="rounded-full border border-[rgba(62,46,31,0.1)] bg-[rgba(255,255,255,0.6)] px-3 py-2 text-xs text-[var(--muted-strong)]">
              Neighborhood: {neighborhoods.find((item) => item.slug === neighborhood)?.name ?? neighborhood}
            </span>
          ) : null}
          {sort !== "recommended" ? (
            <span className="rounded-full border border-[rgba(62,46,31,0.1)] bg-[rgba(255,255,255,0.6)] px-3 py-2 text-xs text-[var(--muted-strong)]">Sort: {sort}</span>
          ) : null}
          {activeFilterCount === 0 ? (
            <span className="rounded-full border border-[rgba(62,46,31,0.1)] bg-[rgba(255,255,255,0.6)] px-3 py-2 text-xs text-[var(--muted-strong)]">
              Showing recommended businesses
            </span>
          ) : null}
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
