import { notFound } from "next/navigation";

import { toggleBusinessSave } from "@/features/businesses/logic";
import type {
  AppDatabase,
  Business,
  BusinessCardData,
  DiscoverFilters,
  DiscoverSort,
  Review
} from "@/features/businesses/types";
import { readDatabase, updateDatabase } from "@/server/database";

function resolveSavedBusinessIds(database: AppDatabase, viewerId?: string | null) {
  if (!viewerId) {
    return new Set<string>();
  }

  return new Set(
    database.saves
      .filter((save) => save.viewerId === viewerId)
      .map((save) => save.businessId)
  );
}

function mapBusinessCardData(
  business: Business,
  database: AppDatabase,
  viewerId?: string | null
): BusinessCardData {
  const category = database.categories.find((item) => item.id === business.categoryId);
  const neighborhood = database.neighborhoods.find((item) => item.id === business.neighborhoodId);
  const savedBusinessIds = resolveSavedBusinessIds(database, viewerId);

  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    shortDescription: business.shortDescription,
    address: business.address,
    priceTier: business.priceTier,
    category: category?.name ?? "Unknown",
    neighborhood: neighborhood?.name ?? "Unknown",
    tags: business.tags,
    rating: business.rating,
    reviewCount: business.reviewCount,
    saveCount: business.saveCount,
    coverFrom: business.coverFrom,
    coverTo: business.coverTo,
    isSaved: savedBusinessIds.has(business.id)
  };
}

function sortBusinesses(businesses: Business[], sort: DiscoverSort) {
  const sortable = [...businesses];

  return sortable.sort((left, right) => {
    if (sort === "top-rated") {
      return right.rating - left.rating || right.reviewCount - left.reviewCount;
    }

    if (sort === "most-reviewed") {
      return right.reviewCount - left.reviewCount || right.rating - left.rating;
    }

    if (sort === "most-saved") {
      return right.saveCount - left.saveCount || right.rating - left.rating;
    }

    const leftScore = left.rating * 2 + left.reviewCount * 0.25 + left.saveCount * 0.5;
    const rightScore = right.rating * 2 + right.reviewCount * 0.25 + right.saveCount * 0.5;
    return rightScore - leftScore;
  });
}

function matchesQuery(business: Business, database: AppDatabase, query?: string) {
  if (!query) {
    return true;
  }

  const normalized = query.trim().toLowerCase();
  const category = database.categories.find((item) => item.id === business.categoryId);
  const neighborhood = database.neighborhoods.find((item) => item.id === business.neighborhoodId);

  return [
    business.name,
    business.shortDescription,
    business.longDescription,
    business.address,
    business.tags.join(" "),
    category?.name ?? "",
    neighborhood?.name ?? ""
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function resolvePublicReviews(database: AppDatabase, businessId: string) {
  return database.reviews
    .filter((review) => review.businessId === businessId && review.status === "published")
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1));
}

export async function getHomePageData(viewerId?: string | null) {
  const database = await readDatabase();
  const featuredBusinesses = sortBusinesses(database.businesses, "recommended")
    .slice(0, 3)
    .map((business) => mapBusinessCardData(business, database, viewerId));

  const recentReviews = database.reviews
    .filter((review) => review.status === "published")
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .slice(0, 4)
    .map((review) => {
      const business = database.businesses.find((item) => item.id === review.businessId);
      return {
        ...review,
        businessName: business?.name ?? "Unknown business"
      };
    });

  return {
    featuredBusinesses,
    recentReviews,
    stats: {
      businessCount: database.businesses.length,
      reviewCount: database.reviews.filter((review) => review.status === "published").length,
      neighborhoodCount: database.neighborhoods.length,
      saveCount: database.saves.length
    }
  };
}

export async function getDiscoverPageData(filters: DiscoverFilters, viewerId?: string | null) {
  const database = await readDatabase();
  const sort = filters.sort ?? "recommended";

  const filteredBusinesses = sortBusinesses(
    database.businesses.filter((business) => {
      const category = database.categories.find((item) => item.id === business.categoryId);
      const neighborhood = database.neighborhoods.find((item) => item.id === business.neighborhoodId);

      return (
        matchesQuery(business, database, filters.query) &&
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

function getReviewDistribution(reviews: Review[]) {
  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length
  }));
}

export async function getBusinessPageData(slug: string, viewerId?: string | null) {
  const database = await readDatabase();
  const business = database.businesses.find((item) => item.slug === slug);

  if (!business) {
    notFound();
  }

  const category = database.categories.find((item) => item.id === business.categoryId);
  const neighborhood = database.neighborhoods.find((item) => item.id === business.neighborhoodId);
  const reviews = resolvePublicReviews(database, business.id);
  const relatedBusinesses = database.businesses
    .filter((item) => item.id !== business.id && item.categoryId === business.categoryId)
    .slice(0, 3)
    .map((item) => mapBusinessCardData(item, database, viewerId));

  return {
    business: mapBusinessCardData(business, database, viewerId),
    detail: {
      longDescription: business.longDescription,
      address: business.address,
      category: category?.name ?? "Unknown",
      neighborhood: neighborhood?.name ?? "Unknown"
    },
    reviews,
    reviewDistribution: getReviewDistribution(reviews),
    relatedBusinesses
  };
}

export async function toggleSaveForViewer(businessId: string, viewerId: string) {
  let response: { saved: boolean; saveCount: number } = { saved: false, saveCount: 0 };

  await updateDatabase((database) => {
    const result = toggleBusinessSave(database, businessId, viewerId);
    response = {
      saved: result.saved,
      saveCount: result.saveCount
    };
    return result.database;
  });

  return response;
}
