import type {
  AppDatabase,
  Business,
  BusinessCardData,
  DiscoverSort,
  Review
} from "@/features/businesses/types";

export function resolveSavedBusinessIds(database: AppDatabase, viewerId?: string | null) {
  if (!viewerId) {
    return new Set<string>();
  }

  return new Set(
    database.saves
      .filter((save) => save.userId === viewerId)
      .map((save) => save.businessId)
  );
}

export function mapBusinessCardData(
  business: Business,
  database: AppDatabase,
  viewerId?: string | null
): BusinessCardData {
  const category = database.categories.find((item) => item.id === business.categoryId);
  const neighborhood = database.neighborhoods.find((item) => item.id === business.neighborhoodId);
  const savedBusinessIds = resolveSavedBusinessIds(database, viewerId);
  const owner = business.ownerUserId
    ? database.users.find((user) => user.id === business.ownerUserId)
    : null;

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
    isSaved: savedBusinessIds.has(business.id),
    ownerName: owner?.displayName
  };
}

export function sortBusinesses(businesses: Business[], sort: DiscoverSort) {
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

export function matchesBusinessQuery(
  business: Business,
  database: AppDatabase,
  query?: string
) {
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

export function resolvePublicReviews(database: AppDatabase, businessId: string) {
  return database.reviews
    .filter((review) => review.businessId === businessId && review.status === "published")
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1));
}

export function getReviewDistribution(reviews: Review[]) {
  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length
  }));
}
