import { z } from "zod";

import type { Review } from "@/features/businesses/types";
import type { AppActor } from "@/server/auth/actor";
import { assertCanCreateReview } from "@/server/auth/policies";
import { readDatabase, updateDatabase } from "@/server/database";

export const createReviewSchema = z.object({
  businessId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(80).default(""),
  body: z.string().trim().min(20).max(1000),
  tags: z.array(z.string().trim().min(1).max(32)).max(14).default([]),
  visitDate: z.string().min(1),
  photoUrls: z.array(z.string().min(1)).max(4).default([])
});

export async function createReview(input: unknown, actor: AppActor) {
  assertCanCreateReview(actor);
  const payload = createReviewSchema.parse(input);
  const database = await readDatabase();
  const business = database.businesses.find((entry) => entry.id === payload.businessId);

  if (!business) {
    throw new Error("Business not found.");
  }

  const user = database.users.find((entry) => entry.id === actor.userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const existingReview = database.reviews.find(
    (review) => review.businessId === payload.businessId && review.authorId === actor.userId
  );

  if (existingReview) {
    throw new Error("You have already reviewed this business.");
  }

  const now = new Date().toISOString();
  const review: Review = {
    id: `review_${crypto.randomUUID()}`,
    businessId: payload.businessId,
    authorId: actor.userId!,
    authorName: user.displayName,
    rating: payload.rating,
    title: payload.title.trim(),
    body: payload.body.trim(),
    tags: payload.tags.map((tag) => tag.trim()),
    visitDate: payload.visitDate,
    createdAt: now,
    updatedAt: now,
    status: "published",
    reportCount: 0,
    photoUrls: payload.photoUrls
  };

  await updateDatabase((current) => ({
    ...current,
    reviews: [review, ...current.reviews]
  }));

  return review;
}
