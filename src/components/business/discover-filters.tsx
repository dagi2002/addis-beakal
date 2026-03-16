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
      <div className="rounded-[28px] border border-black/8 bg-white/85 p-4 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-3 lg:hidden">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-black px-4 py-3 text-sm font-medium text-white"
            onClick={() => setOpen(true)}
            type="button"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Sort & filter
          </button>
          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/60">
            <Search className="h-4 w-4" />
            <span>{query || "Search businesses, categories, neighborhoods"}</span>
          </div>
        </div>

        <div className="hidden grid-cols-4 gap-3 lg:grid">
          <input
            className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 outline-none transition focus:border-clay"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search businesses, categories, neighborhoods"
            value={query}
          />
          <select
            className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 outline-none transition focus:border-clay"
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
            className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 outline-none transition focus:border-clay"
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
              className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-black/5 px-4 py-3 outline-none transition focus:border-clay"
              onChange={(event) => setSort(event.target.value as DiscoverSort)}
              value={sort}
            >
              <option value="recommended">Recommended</option>
              <option value="top-rated">Top rated</option>
              <option value="most-reviewed">Most reviewed</option>
              <option value="most-saved">Most saved</option>
            </select>
            <button
              className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
              onClick={applyFilters}
              type="button"
            >
              Apply
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
        <div className="ml-auto h-full w-full max-w-md rounded-[32px] bg-sand p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Refine results</h2>
            <button className="text-sm text-black/60" onClick={() => setOpen(false)} type="button">
              Close
            </button>
          </div>
          <div className="mt-5 space-y-4">
            <input
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none transition focus:border-clay"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              value={query}
            />
            <select
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none transition focus:border-clay"
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
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none transition focus:border-clay"
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
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none transition focus:border-clay"
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
              className="flex-1 rounded-2xl border border-black/10 px-4 py-3"
              onClick={resetFilters}
              type="button"
            >
              Reset
            </button>
            <button
              className="flex-1 rounded-2xl bg-black px-4 py-3 font-medium text-white"
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
