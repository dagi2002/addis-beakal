import { notFound } from "next/navigation";

import {
  getReviewDistribution,
  mapBusinessCardData,
  resolvePublicReviews
} from "@/features/businesses/queries";
import { readDatabase } from "@/server/database";

export async function getBusinessPageData(slug: string, viewerId?: string | null) {
  const database = await readDatabase();
  const business = database.businesses.find((item) => item.slug === slug);

  if (!business) {
    notFound();
  }

  const category = database.categories.find((item) => item.id === business.categoryId);
  const neighborhood = database.neighborhoods.find((item) => item.id === business.neighborhoodId);
  const reviews = resolvePublicReviews(database, business.id);
  const viewerHasReviewed = Boolean(
    viewerId && database.reviews.find((review) => review.businessId === business.id && review.authorId === viewerId)
  );
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
      neighborhood: neighborhood?.name ?? "Unknown",
      ownerName: business.ownerUserId
        ? database.users.find((user) => user.id === business.ownerUserId)?.displayName
        : undefined
    },
    reviews,
    reviewDistribution: getReviewDistribution(reviews),
    relatedBusinesses,
    viewerState: {
      isAuthenticated: Boolean(viewerId),
      hasReviewed: viewerHasReviewed,
      isClaimed: Boolean(business.ownerUserId)
    }
  };
}
