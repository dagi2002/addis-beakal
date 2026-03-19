import {
  mapBusinessCardData,
  matchesBusinessQuery,
  sortBusinesses
} from "@/features/businesses/queries";
import type { DiscoverFilters } from "@/features/businesses/types";
import { readDatabase } from "@/server/database";

const categoryOrder = [
  "restaurants",
  "cafes",
  "hotels",
  "salons",
  "barbers",
  "gyms",
  "clinics",
  "pharmacy",
  "bakeries",
  "bars",
  "spas",
  "car-services"
] as const;

const neighborhoodOrder = [
  "bole",
  "cmc",
  "piassa",
  "mexico",
  "kazanchis",
  "sarbet",
  "gerji",
  "megenagna",
  "lideta",
  "22",
  "ayat",
  "summit"
] as const;

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchesFeature(tags: string[], feature: string, priceTier: string) {
  if (feature === "affordable") {
    return priceTier === "$";
  }

  const normalizedFeature = normalizeToken(feature);
  return tags.some((tag) => normalizeToken(tag).includes(normalizedFeature));
}

export async function getDiscoverPageData(
  filters: DiscoverFilters,
  viewerId?: string | null
) {
  const database = await readDatabase();
  const sort = filters.sort ?? "recommended";

  const filteredBusinesses = sortBusinesses(
    database.businesses.filter((business) => {
      const category = database.categories.find((item) => item.id === business.categoryId);
      const neighborhood = database.neighborhoods.find((item) => item.id === business.neighborhoodId);

      return (
        matchesBusinessQuery(business, database, filters.query) &&
        (!filters.category || category?.slug === filters.category) &&
        (!filters.neighborhood || neighborhood?.slug === filters.neighborhood) &&
        (!filters.minRating || business.rating >= filters.minRating) &&
        (!filters.priceTiers?.length || filters.priceTiers.includes(business.priceTier)) &&
        (!filters.features?.length ||
          filters.features.every((feature) => matchesFeature(business.tags, feature, business.priceTier)))
      );
    }),
    sort
  );

  return {
    businesses: filteredBusinesses.map((business) => mapBusinessCardData(business, database, viewerId)),
    categories: [...database.categories].sort(
      (left, right) =>
        categoryOrder.indexOf(left.slug as (typeof categoryOrder)[number]) -
        categoryOrder.indexOf(right.slug as (typeof categoryOrder)[number])
    ),
    neighborhoods: [...database.neighborhoods].sort(
      (left, right) =>
        neighborhoodOrder.indexOf(left.slug as (typeof neighborhoodOrder)[number]) -
        neighborhoodOrder.indexOf(right.slug as (typeof neighborhoodOrder)[number])
    ),
    activeFilters: {
      query: filters.query ?? "",
      category: filters.category ?? "",
      neighborhood: filters.neighborhood ?? "",
      minRating: filters.minRating,
      priceTiers: filters.priceTiers ?? [],
      features: filters.features ?? [],
      sort
    }
  };
}
