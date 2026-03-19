import {
  mapBusinessCardData,
  sortBusinesses
} from "@/features/businesses/queries";
import { readDatabase } from "@/server/database";

export async function getHomePageData(viewerId?: string | null) {
  const database = await readDatabase();
  const sortedBusinesses = sortBusinesses(database.businesses, "recommended");
  const featuredBusinesses = sortedBusinesses
    .slice(0, 6)
    .map((business) => mapBusinessCardData(business, database, viewerId));
  const topRatedBusinesses = sortBusinesses(database.businesses, "top-rated")
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
        businessName: business?.name ?? "Unknown business",
        businessSlug: business?.slug ?? ""
      };
    });

  return {
    featuredBusinesses,
    topRatedBusinesses,
    recentReviews,
    neighborhoods: database.neighborhoods,
    stats: {
      businessCount: database.businesses.length,
      reviewCount: database.reviews.filter((review) => review.status === "published").length,
      neighborhoodCount: database.neighborhoods.length,
      saveCount: database.saves.length,
      userCount: database.users.length
    }
  };
}
