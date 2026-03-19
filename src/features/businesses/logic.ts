import type {
  AppDatabase,
  Business,
  BusinessEngagementEvent,
  Review,
  Save
} from "@/features/businesses/types";

export function isPublicReview(review: Review) {
  return review.status === "published";
}

export function recalculateBusinessMetrics(
  business: Business,
  reviews: Review[],
  saves: Save[],
  engagementEvents: BusinessEngagementEvent[]
): Business {
  const publicReviews = reviews.filter((review) => review.businessId === business.id && isPublicReview(review));
  const businessSaves = saves.filter((save) => save.businessId === business.id);
  const pageViews = engagementEvents.filter(
    (event) => event.businessId === business.id && event.type === "page_view"
  );
  const reviewCount = publicReviews.length;
  const rating =
    reviewCount === 0
      ? 0
      : publicReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;

  return {
    ...business,
    rating: Number(rating.toFixed(1)),
    reviewCount,
    saveCount: businessSaves.length,
    viewCount: pageViews.length
  };
}

export function syncBusinessMetrics(database: AppDatabase, businessId: string) {
  database.businesses = database.businesses.map((business) =>
    business.id === businessId
      ? recalculateBusinessMetrics(business, database.reviews, database.saves, database.engagementEvents)
      : business
  );

  return database;
}

export function syncAllBusinessMetrics(database: AppDatabase) {
  database.businesses = database.businesses.map((business) =>
    recalculateBusinessMetrics(business, database.reviews, database.saves, database.engagementEvents)
  );

  return database;
}

export function toggleBusinessSave(database: AppDatabase, businessId: string, viewerId: string) {
  const existingSave = database.saves.find(
    (save) => save.businessId === businessId && save.userId === viewerId
  );

  if (existingSave) {
    database.saves = database.saves.filter((save) => save.id !== existingSave.id);
    syncBusinessMetrics(database, businessId);

    return {
      database,
      saved: false,
      saveCount: database.businesses.find((business) => business.id === businessId)?.saveCount ?? 0
    };
  }

  database.saves.push({
    id: `save_${crypto.randomUUID()}`,
    businessId,
    userId: viewerId,
    createdAt: new Date().toISOString()
  });

  syncBusinessMetrics(database, businessId);

  return {
    database,
    saved: true,
    saveCount: database.businesses.find((business) => business.id === businessId)?.saveCount ?? 0
  };
}
