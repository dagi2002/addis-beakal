import { z } from "zod";

import type { AppActor } from "@/server/auth/actor";
import { readDatabase, updateDatabase } from "@/server/database";

const pageViewWindowMs = 30 * 60 * 1000;

export const recordBusinessEngagementSchema = z.object({
  type: z.enum(["page_view", "map_view", "directions_click"]),
  sessionKey: z.string().trim().min(8).max(120),
  reviewId: z.string().trim().optional().or(z.literal(""))
});

export async function recordBusinessEngagement(businessId: string, input: unknown, actor: AppActor) {
  const payload = recordBusinessEngagementSchema.parse(input);
  const now = new Date().toISOString();
  let eventRecorded = false;

  await updateDatabase((current) => {
    const business = current.businesses.find((entry) => entry.id === businessId);
    if (!business) {
      throw new Error("Business not found.");
    }

    const recentDuplicate =
      payload.type === "page_view"
        ? current.engagementEvents.find(
            (event) =>
              event.businessId === businessId &&
              event.type === "page_view" &&
              event.sessionKey === payload.sessionKey &&
              Date.parse(now) - Date.parse(event.createdAt) < pageViewWindowMs
          )
        : null;

    if (recentDuplicate) {
      return current;
    }

    current.engagementEvents.unshift({
      id: `engagement_${crypto.randomUUID()}`,
      businessId,
      reviewId: payload.reviewId?.trim() || undefined,
      userId: actor.userId ?? undefined,
      sessionKey: payload.sessionKey,
      type: payload.type,
      createdAt: now
    });
    eventRecorded = true;

    return current;
  });

  const database = await readDatabase();
  const business = database.businesses.find((entry) => entry.id === businessId);

  return {
    recorded: eventRecorded,
    viewCount: business?.viewCount ?? 0
  };
}
