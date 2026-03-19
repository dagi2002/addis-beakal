import { z } from "zod";

import type { Report } from "@/features/businesses/types";
import type { AppActor } from "@/server/auth/actor";
import { assertCanSubmitReport } from "@/server/auth/policies";
import { readDatabase, updateDatabase } from "@/server/database";

const reportReasons = [
  "Spam or promotional",
  "Harassment or hate",
  "False information",
  "Off-topic",
  "Other"
] as const;

export const reportReasonsList = [...reportReasons];

export const submitReportSchema = z.object({
  businessId: z.string().min(1),
  reviewId: z.string().optional(),
  reason: z.enum(reportReasons),
  details: z.string().min(10).max(500),
  contactEmail: z.string().email().optional().or(z.literal(""))
});

export async function submitReport(input: unknown, actor: AppActor) {
  assertCanSubmitReport(actor);
  const payload = submitReportSchema.parse(input);
  const database = await readDatabase();

  const business = database.businesses.find((item) => item.id === payload.businessId);
  if (!business) {
    throw new Error("Business not found.");
  }

  if (payload.reviewId) {
    const review = database.reviews.find(
      (item) => item.id === payload.reviewId && item.businessId === payload.businessId
    );

    if (!review) {
      throw new Error("Review not found.");
    }
  }

  const report: Report = {
    id: `report_${crypto.randomUUID()}`,
    businessId: payload.businessId,
    reviewId: payload.reviewId,
    userId: actor.userId!,
    reason: payload.reason,
    details: payload.details,
    contactEmail: payload.contactEmail || undefined,
    createdAt: new Date().toISOString(),
    status: "open"
  };

  await updateDatabase((current) => {
    current.reports.push(report);

    if (payload.reviewId) {
      current.reviews = current.reviews.map((review) =>
        review.id === payload.reviewId
          ? {
              ...review,
              reportCount: review.reportCount + 1
            }
          : review
      );
    }

    return current;
  });

  return report;
}
