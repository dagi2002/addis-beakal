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
      business: database.businesses.find((business) => business.id === review.businessId) ?? null
    }));

  const savedBusinesses = database.saves
    .filter((save) => save.userId === userId)
    .map((save) => database.businesses.find((business) => business.id === save.businessId))
    .filter((business): business is NonNullable<typeof business> => Boolean(business))
    .map((business) => mapBusinessCardData(business, database, userId));

  const ownedBusinesses = database.businesses.filter((business) => business.ownerUserId === userId);

  return {
    user,
    userReviews,
    savedBusinesses,
    ownedBusinesses
  };
}

export { updateUserDisplayName };
