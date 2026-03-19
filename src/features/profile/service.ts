import { mapBusinessCardData } from "@/features/businesses/queries";
import { readDatabase } from "@/server/database";
import { updateUserDisplayName } from "@/server/auth/service";

export async function getProfilePageData(userId: string) {
  const database = await readDatabase();
  const user = database.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User not found.");
  }

  const userReviews = database.reviews
    .filter((review) => review.authorId === userId)
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .map((review) => ({
      ...review,
      business: (() => {
        const business = database.businesses.find((entry) => entry.id === review.businessId);
        if (!business) {
          return null;
        }

        return {
          ...business,
          category: database.categories.find((item) => item.id === business.categoryId)?.name ?? "Unknown",
          neighborhood:
            database.neighborhoods.find((item) => item.id === business.neighborhoodId)?.name ?? "Unknown"
        };
      })()
    }));

  const savedBusinesses = database.saves
    .filter((save) => save.userId === userId)
    .map((save) => database.businesses.find((business) => business.id === save.businessId))
    .filter((business): business is NonNullable<typeof business> => Boolean(business))
    .map((business) => mapBusinessCardData(business, database, userId));

  const ownedBusinesses = database.businesses
    .filter((business) => business.ownerUserId === userId)
    .map((business) => ({
      ...business,
      category: database.categories.find((item) => item.id === business.categoryId)?.name ?? "Unknown",
      neighborhood:
        database.neighborhoods.find((item) => item.id === business.neighborhoodId)?.name ?? "Unknown"
    }));

  const publishedReviews = userReviews.filter((review) => review.status === "published");
  const pendingReviews = userReviews.filter((review) => review.status === "pending");
  const moderatedReviews = userReviews.filter(
    (review) => review.status === "rejected" || review.status === "removed"
  );
  const savedCategoryCounts = new Map<string, number>();
  const savedNeighborhoodCounts = new Map<string, number>();

  for (const business of savedBusinesses) {
    savedCategoryCounts.set(business.category, (savedCategoryCounts.get(business.category) ?? 0) + 1);
    savedNeighborhoodCounts.set(
      business.neighborhood,
      (savedNeighborhoodCounts.get(business.neighborhood) ?? 0) + 1
    );
  }

  const topSavedCategories = Array.from(savedCategoryCounts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3)
    .map(([name]) => name);

  const topSavedNeighborhoods = Array.from(savedNeighborhoodCounts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3)
    .map(([name]) => name);

  return {
    user,
    userReviews,
    savedBusinesses,
    ownedBusinesses,
    stats: {
      reviewCount: userReviews.length,
      publishedReviewCount: publishedReviews.length,
      pendingReviewCount: pendingReviews.length,
      moderatedReviewCount: moderatedReviews.length,
      averageRatingGiven:
        publishedReviews.length > 0
          ? Number(
              (
                publishedReviews.reduce((sum, review) => sum + review.rating, 0) / publishedReviews.length
              ).toFixed(1)
            )
          : 0,
      savedCount: savedBusinesses.length,
      savedCategoryCount: savedCategoryCounts.size,
      savedNeighborhoodCount: savedNeighborhoodCounts.size,
      ownedCount: ownedBusinesses.length
    },
    savedInsights: {
      topCategories: topSavedCategories,
      topNeighborhoods: topSavedNeighborhoods
    }
  };
}

export { updateUserDisplayName };
