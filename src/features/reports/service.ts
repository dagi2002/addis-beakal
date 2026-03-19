import { z } from "zod";

import type { AppDatabase, Report, ReportTargetType } from "@/features/businesses/types";
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
  targetType: z.enum(["business", "review", "owner_reply", "direct_message"]).optional(),
  targetId: z.string().trim().optional(),
  reviewId: z.string().trim().optional(),
  reason: z.enum(reportReasons),
  details: z.string().min(10).max(500),
  contactEmail: z.string().email().optional().or(z.literal(""))
});

function resolveReportTarget(payload: z.infer<typeof submitReportSchema>) {
  const targetType: ReportTargetType = payload.targetType ?? (payload.reviewId ? "review" : "business");
  const targetId = payload.targetId?.trim() || payload.reviewId?.trim() || payload.businessId;

  return {
    targetType,
    targetId
  };
}

function findDirectMessage(database: AppDatabase, messageId: string) {
  for (const thread of database.reviewDirectThreads) {
    const message = thread.messages.find((entry) => entry.id === messageId);
    if (message) {
      return { thread, message };
    }
  }

  return null;
}

function validateReportTarget(database: AppDatabase, businessId: string, targetType: ReportTargetType, targetId: string) {
  const business = database.businesses.find((item) => item.id === businessId);
  if (!business) {
    throw new Error("Business not found.");
  }

  if (targetType === "business") {
    return;
  }

  if (targetType === "review") {
    const review = database.reviews.find((item) => item.id === targetId && item.businessId === businessId);
    if (!review) {
      throw new Error("Review not found.");
    }
    return;
  }

  if (targetType === "owner_reply") {
    const reply = database.ownerReviewReplies.find((item) => item.id === targetId && item.businessId === businessId);
    if (!reply) {
      throw new Error("Owner reply not found.");
    }
    return;
  }

  const directMessage = findDirectMessage(database, targetId);
  if (!directMessage || directMessage.thread.businessId !== businessId) {
    throw new Error("Direct message not found.");
  }
}

export async function submitReport(input: unknown, actor: AppActor) {
  assertCanSubmitReport(actor);
  const payload = submitReportSchema.parse(input);
  const database = await readDatabase();
  const { targetType, targetId } = resolveReportTarget(payload);

  validateReportTarget(database, payload.businessId, targetType, targetId);

  const report: Report = {
    id: `report_${crypto.randomUUID()}`,
    businessId: payload.businessId,
    userId: actor.userId!,
    targetType,
    targetId,
    reason: payload.reason,
    details: payload.details,
    contactEmail: payload.contactEmail || undefined,
    createdAt: new Date().toISOString(),
    status: "open"
  };

  await updateDatabase((current) => {
    current.reports.unshift(report);

    if (targetType === "review") {
      current.reviews = current.reviews.map((review) =>
        review.id === targetId
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
