import { z } from "zod";

import { queueNotifications } from "@/features/notifications/service";
import { assertCanUseOwnerTools, AuthorizationError } from "@/server/auth/policies";
import type { AppActor } from "@/server/auth/actor";
import { readDatabase, updateDatabase } from "@/server/database";

const ownerReplySchema = z.object({
  body: z.string().trim().min(4).max(500)
});

const threadMessageSchema = z.object({
  body: z.string().trim().min(4).max(1000)
});

const ownerListingUpdateSchema = z.object({
  shortDescription: z.string().trim().min(20).max(140),
  longDescription: z.string().trim().min(40).max(900),
  googleMapsUrl: z.string().trim().url("Enter a valid Google Maps URL.").optional().or(z.literal("")),
  photoUrls: z.array(z.string().trim().url("Enter valid photo URLs.")).max(8).default([]),
  openingHours: z.array(z.tuple([z.string().trim().min(1), z.string().trim().min(1).max(48)])).length(7)
});

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function isWithinLastThirtyDays(value: string) {
  return Date.now() - Date.parse(value) <= THIRTY_DAYS_MS;
}

function getManagedBusiness(database: Awaited<ReturnType<typeof readDatabase>>, businessId: string, actor: AppActor) {
  const business = database.businesses.find((entry) => entry.id === businessId);

  if (!business) {
    throw new Error("Business not found.");
  }

  if (!business.ownerUserId) {
    throw new Error("This business does not have an approved owner yet.");
  }

  if (actor.role !== "admin" && business.ownerUserId !== actor.userId) {
    throw new AuthorizationError("You can only manage your own claimed business.", 403);
  }

  return business;
}

function getManagedReview(database: Awaited<ReturnType<typeof readDatabase>>, reviewId: string, actor: AppActor) {
  const review = database.reviews.find((entry) => entry.id === reviewId);

  if (!review) {
    throw new Error("Review not found.");
  }

  const business = getManagedBusiness(database, review.businessId, actor);

  if (review.status !== "published") {
    throw new Error("Only published reviews can receive owner responses.");
  }

  return { review, business };
}

export async function getOwnerDashboardData(actor: AppActor) {
  assertCanUseOwnerTools(actor);
  const database = await readDatabase();
  const ownedBusinesses =
    actor.role === "admin"
      ? database.businesses.filter((business) => Boolean(business.ownerUserId))
      : database.businesses.filter((business) => business.ownerUserId === actor.userId);

  const repliesByReviewId = new Map(
    database.ownerReviewReplies
      .filter((reply) => reply.status === "active")
      .map((reply) => [reply.reviewId, reply] as const)
  );
  const threadsByReviewId = new Map(database.reviewDirectThreads.map((thread) => [thread.reviewId, thread] as const));

  return {
    businesses: ownedBusinesses.map((business) => {
      const recentEvents = database.engagementEvents.filter(
        (event) => event.businessId === business.id && isWithinLastThirtyDays(event.createdAt)
      );
      const recentSaves = database.saves.filter(
        (save) => save.businessId === business.id && isWithinLastThirtyDays(save.createdAt)
      );
      const recentReviews = database.reviews.filter(
        (review) =>
          review.businessId === business.id &&
          review.status === "published" &&
          isWithinLastThirtyDays(review.createdAt)
      );
      const publishedReviews = database.reviews
        .filter((review) => review.businessId === business.id && review.status === "published")
        .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1));

      const responseQueue = publishedReviews.map((review) => {
        const reviewAuthor = database.users.find((user) => user.id === review.authorId) ?? null;
        const reply = repliesByReviewId.get(review.id) ?? null;
        const thread = threadsByReviewId.get(review.id) ?? null;

        return {
          ...review,
          reviewAuthor,
          ownerReply: reply,
          thread:
            thread === null
              ? null
              : {
                  id: thread.id,
                  status: thread.status,
                  lastMessageAt: thread.lastMessageAt,
                  messageCount: thread.messages.filter((message) => message.status === "active").length,
                  messages: thread.messages.filter((message) => message.status === "active")
                }
        };
      });

      return {
        ...business,
        pageVisitsLast30Days: recentEvents.filter((event) => event.type === "page_view").length,
        savesLast30Days: recentSaves.length,
        reviewsLast30Days: recentReviews.length,
        mapIntentLast30Days: recentEvents.filter(
          (event) => event.type === "map_view" || event.type === "directions_click"
        ).length,
        unrepliedReviewCount: responseQueue.filter((review) => !review.ownerReply).length,
        responseQueue,
        listingHealth: {
          hasHours: Boolean(business.openingHours?.some(([, hours]) => Boolean(hours.trim()))),
          photoCount: business.photoUrls?.length ?? 0,
          hasDescription: business.longDescription.trim().length >= 40,
          hasMapLink: Boolean(business.googleMapsUrl)
        }
      };
    })
  };
}

export async function updateOwnedBusiness(businessId: string, input: unknown, actor: AppActor) {
  assertCanUseOwnerTools(actor);
  const payload = ownerListingUpdateSchema.parse(input);

  let updatedBusinessId = "";
  await updateDatabase((current) => {
    const business = getManagedBusiness(current, businessId, actor);

    current.businesses = current.businesses.map((entry) =>
      entry.id === business.id
        ? {
            ...entry,
            shortDescription: payload.shortDescription,
            longDescription: payload.longDescription,
            googleMapsUrl: payload.googleMapsUrl?.trim() || undefined,
            photoUrls: payload.photoUrls.map((url) => url.trim()).filter(Boolean),
            openingHours: payload.openingHours.map(([day, hours]) => [day, hours.trim()] as [string, string])
          }
        : entry
    );
    updatedBusinessId = business.id;

    return current;
  });

  const database = await readDatabase();
  return database.businesses.find((business) => business.id === updatedBusinessId) ?? null;
}

export async function createOwnerReply(reviewId: string, input: unknown, actor: AppActor) {
  assertCanUseOwnerTools(actor);
  const payload = ownerReplySchema.parse(input);

  let replyId = "";
  await updateDatabase((current) => {
    const { review, business } = getManagedReview(current, reviewId, actor);
    const existingReply = current.ownerReviewReplies.find((entry) => entry.reviewId === review.id);
    const ownerUserId = business.ownerUserId!;
    const now = new Date().toISOString();

    if (existingReply && existingReply.status === "active") {
      throw new Error("This review already has an owner reply.");
    }

    if (existingReply) {
      current.ownerReviewReplies = current.ownerReviewReplies.map((entry) =>
        entry.id === existingReply.id
          ? {
              ...entry,
              ownerUserId,
              body: payload.body,
              status: "active",
              updatedAt: now
            }
          : entry
      );
      replyId = existingReply.id;

      if (review.authorId !== ownerUserId) {
        queueNotifications(
          current,
          [review.authorId],
          {
            kind: "owner_reply_received",
            title: `${business.name} replied to your review`,
            body: "A business owner posted a public reply below your review.",
            actionHref: `/business/${business.slug}`,
            actionLabel: "View public reply",
            senderUserId: ownerUserId
          },
          now
        );
      }

      return current;
    }

    const reply = {
      id: `owner_reply_${crypto.randomUUID()}`,
      businessId: business.id,
      reviewId: review.id,
      ownerUserId,
      body: payload.body,
      status: "active" as const,
      createdAt: now,
      updatedAt: now
    };

    current.ownerReviewReplies.unshift(reply);
    replyId = reply.id;

    if (review.authorId !== ownerUserId) {
      queueNotifications(
        current,
        [review.authorId],
        {
          kind: "owner_reply_received",
          title: `${business.name} replied to your review`,
          body: "A business owner posted a public reply below your review.",
          actionHref: `/business/${business.slug}`,
          actionLabel: "View public reply",
          senderUserId: ownerUserId
        },
        now
      );
    }

    return current;
  });

  const database = await readDatabase();
  return database.ownerReviewReplies.find((entry) => entry.id === replyId) ?? null;
}

export async function updateOwnerReply(reviewId: string, input: unknown, actor: AppActor) {
  assertCanUseOwnerTools(actor);
  const payload = ownerReplySchema.parse(input);

  let replyId = "";
  await updateDatabase((current) => {
    const { review } = getManagedReview(current, reviewId, actor);
    const existingReply = current.ownerReviewReplies.find(
      (entry) => entry.reviewId === review.id && entry.status === "active"
    );

    if (!existingReply) {
      throw new Error("No owner reply exists for this review yet.");
    }

    const now = new Date().toISOString();
    current.ownerReviewReplies = current.ownerReviewReplies.map((entry) =>
      entry.id === existingReply.id
        ? {
            ...entry,
            body: payload.body,
            updatedAt: now
          }
        : entry
    );
    replyId = existingReply.id;

    return current;
  });

  const database = await readDatabase();
  return database.ownerReviewReplies.find((entry) => entry.id === replyId) ?? null;
}

export async function removeOwnerReply(reviewId: string, actor: AppActor) {
  assertCanUseOwnerTools(actor);

  await updateDatabase((current) => {
    const { review } = getManagedReview(current, reviewId, actor);
    const existingReply = current.ownerReviewReplies.find(
      (entry) => entry.reviewId === review.id && entry.status === "active"
    );

    if (!existingReply) {
      throw new Error("No active owner reply exists for this review.");
    }

    current.ownerReviewReplies = current.ownerReviewReplies.map((entry) =>
      entry.id === existingReply.id
        ? {
            ...entry,
            status: "removed",
            updatedAt: new Date().toISOString()
          }
        : entry
    );

    return current;
  });
}

export async function startReviewThread(reviewId: string, input: unknown, actor: AppActor) {
  assertCanUseOwnerTools(actor);
  const payload = threadMessageSchema.parse(input);
  let threadId = "";
  await updateDatabase((current) => {
    const { review, business } = getManagedReview(current, reviewId, actor);
    if (business.ownerMessagingDisabledAt) {
      throw new Error("Owner messaging is currently suspended for this business.");
    }

    const existingThread = current.reviewDirectThreads.find((entry) => entry.reviewId === review.id);
    if (existingThread && existingThread.status !== "removed") {
      throw new Error("A private thread already exists for this review.");
    }

    const now = new Date().toISOString();
    const ownerUserId = business.ownerUserId!;
    const firstMessage = {
      id: `thread_message_${crypto.randomUUID()}`,
      senderUserId: ownerUserId,
      senderRole: "owner" as const,
      body: payload.body,
      status: "active" as const,
      createdAt: now
    };

    if (existingThread) {
      current.reviewDirectThreads = current.reviewDirectThreads.map((entry) =>
        entry.id === existingThread.id
          ? {
              ...entry,
              ownerUserId,
              reviewAuthorId: review.authorId,
              status: "open",
              updatedAt: now,
              lastMessageAt: now,
              messages: [firstMessage]
            }
          : entry
      );
      threadId = existingThread.id;
      queueNotifications(
        current,
        [review.authorId],
        {
          kind: "direct_thread_message",
          title: `${business.name} sent a private follow-up`,
          body: "An owner started a private conversation about your review.",
          actionHref: "/profile?section=inbox",
          actionLabel: "Open inbox",
          senderUserId: ownerUserId
        },
        now
      );
      return current;
    }

    const thread = {
      id: `review_thread_${crypto.randomUUID()}`,
      businessId: business.id,
      reviewId: review.id,
      ownerUserId,
      reviewAuthorId: review.authorId,
      status: "open" as const,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      messages: [firstMessage]
    };

    current.reviewDirectThreads.unshift(thread);
    threadId = thread.id;
    queueNotifications(
      current,
      [review.authorId],
      {
        kind: "direct_thread_message",
        title: `${business.name} sent a private follow-up`,
        body: "An owner started a private conversation about your review.",
        actionHref: "/profile?section=inbox",
        actionLabel: "Open inbox",
        senderUserId: ownerUserId
      },
      now
    );

    return current;
  });

  const database = await readDatabase();
  return database.reviewDirectThreads.find((thread) => thread.id === threadId) ?? null;
}

export async function addReviewThreadMessage(threadId: string, input: unknown, actor: AppActor) {
  const payload = threadMessageSchema.parse(input);
  if (!actor.userId) {
    throw new AuthorizationError("Please sign in to continue.", 401);
  }

  await updateDatabase((current) => {
    const thread = current.reviewDirectThreads.find((entry) => entry.id === threadId);
    if (!thread) {
      throw new Error("Thread not found.");
    }

    const business = current.businesses.find((entry) => entry.id === thread.businessId);
    if (!business) {
      throw new Error("Business not found.");
    }

    const isOwnerSender = actor.role === "admin" || actor.userId === thread.ownerUserId;
    const isReviewerSender = actor.userId === thread.reviewAuthorId;

    if (!isOwnerSender && !isReviewerSender) {
      throw new AuthorizationError("You cannot reply in this thread.", 403);
    }

    if (thread.status !== "open") {
      throw new Error("This thread is no longer open.");
    }

    if (isOwnerSender && business.ownerMessagingDisabledAt) {
      throw new Error("Owner messaging is currently suspended for this business.");
    }

    const now = new Date().toISOString();
    const recipientUserId = isOwnerSender ? thread.reviewAuthorId : thread.ownerUserId;
    const senderBusinessName = business.name;
    current.reviewDirectThreads = current.reviewDirectThreads.map((entry) =>
      entry.id === thread.id
        ? {
            ...entry,
            updatedAt: now,
            lastMessageAt: now,
            messages: [
              ...entry.messages,
              {
                id: `thread_message_${crypto.randomUUID()}`,
                senderUserId: actor.userId!,
                senderRole: isOwnerSender ? "owner" : "reviewer",
                body: payload.body,
                status: "active",
                createdAt: now
              }
            ]
          }
        : entry
    );

    queueNotifications(
      current,
      [recipientUserId],
      {
        kind: "direct_thread_message",
        title: isOwnerSender
          ? `${senderBusinessName} sent a private follow-up`
          : `New reply in your ${senderBusinessName} thread`,
        body: isOwnerSender
          ? "A business owner replied privately to continue the conversation."
          : "The reviewer sent a private reply in an existing owner follow-up thread.",
        actionHref: isOwnerSender ? "/profile?section=inbox" : "/owner",
        actionLabel: isOwnerSender ? "Open inbox" : "Open owner dashboard",
        senderUserId: actor.userId!
      },
      now
    );

    return current;
  });

  const database = await readDatabase();
  return database.reviewDirectThreads.find((thread) => thread.id === threadId) ?? null;
}
