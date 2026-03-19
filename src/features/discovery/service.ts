import {
  mapBusinessCardData,
  matchesBusinessQuery,
  sortBusinesses
} from "@/features/businesses/queries";
import type { DiscoverFilters } from "@/features/businesses/types";
import { readDatabase } from "@/server/database";

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
        (!filters.neighborhood || neighborhood?.slug === filters.neighborhood)
      );
    }),
    sort
  );

  return {
    businesses: filteredBusinesses.map((business) => mapBusinessCardData(business, database, viewerId)),
    categories: database.categories,
    neighborhoods: database.neighborhoods,
    activeFilters: {
      query: filters.query ?? "",
      category: filters.category ?? "",
      neighborhood: filters.neighborhood ?? "",
      sort
    }
  };
}
