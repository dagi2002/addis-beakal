import { notFound } from "next/navigation";
import { z } from "zod";

import type { ClaimStatus, Report, ReportTargetType } from "@/features/businesses/types";
import { queueNotifications } from "@/features/notifications/service";
import type { AppActor } from "@/server/auth/actor";
import { assertIsAdmin } from "@/server/auth/policies";
import { readDatabase, updateDatabase } from "@/server/database";

export type AdminClaimView = "all" | "pending" | "approved" | "rejected" | "suspended";

const PAGE_SIZE = 10;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const moderationActionSchema = z.object({
  action: z.enum([
    "dismiss",
    "remove_content",
    "restore_content",
    "close_thread",
    "suspend_owner_messaging"
  ]),
  note: z.string().trim().max(400).optional().or(z.literal(""))
});

const adminRoleUpdateSchema = z.object({
  role: z.enum(["member", "admin"])
});

const ownerAssignmentSchema = z.object({
  businessId: z.string().trim().min(1),
  userId: z.string().trim().min(1)
});

function isWithinLastThirtyDays(value: string) {
  return Date.now() - Date.parse(value) <= THIRTY_DAYS_MS;
}

function mapClaimStatusToView(status: ClaimStatus): Exclude<AdminClaimView, "all"> {
  if (status === "superseded") {
    return "suspended";
  }

  return status;
}

function formatClaimStatusLabel(status: ClaimStatus) {
  return status === "superseded" ? "Suspended" : status.charAt(0).toUpperCase() + status.slice(1);
}

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function getTopCountEntry(map: Map<string, number>) {
  return Array.from(map.entries())
    .sort((left, right) => {
      if (left[1] === right[1]) {
        return left[0].localeCompare(right[0]);
      }

      return right[1] - left[1];
    })
    .map(([name, count]) => ({ name, count }))[0] ?? null;
}

function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems: items.length,
    pageSize
  };
}

function matchesQuery(values: string[], query?: string) {
  if (!query?.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();
  return values.join(" ").toLowerCase().includes(normalizedQuery);
}

function findDirectMessage(database: Awaited<ReturnType<typeof readDatabase>>, messageId: string) {
  for (const thread of database.reviewDirectThreads) {
    const message = thread.messages.find((entry) => entry.id === messageId);
    if (message) {
      return { thread, message };
    }
  }

  return null;
}

function buildModerationEntries(database: Awaited<ReturnType<typeof readDatabase>>) {
  return database.reports
    .slice()
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .map((report) => {
      const business = database.businesses.find((entry) => entry.id === report.businessId) ?? null;
      const reporter = database.users.find((entry) => entry.id === report.userId) ?? null;
      const review =
        report.targetType === "review"
          ? database.reviews.find((entry) => entry.id === report.targetId) ?? null
          : null;
      const ownerReply =
        report.targetType === "owner_reply"
          ? database.ownerReviewReplies.find((entry) => entry.id === report.targetId) ?? null
          : null;
      const directMessage =
        report.targetType === "direct_message" ? findDirectMessage(database, report.targetId) : null;
      const reviewForMessage =
        directMessage === null
          ? null
          : database.reviews.find((entry) => entry.id === directMessage.thread.reviewId) ?? null;

      const contentStatus =
        report.targetType === "review"
          ? review?.status ?? "missing"
          : report.targetType === "owner_reply"
            ? ownerReply?.status ?? "missing"
            : report.targetType === "direct_message"
              ? directMessage?.message.status ?? "missing"
              : "active";

      const targetTypeLabel =
        report.targetType === "owner_reply"
          ? "Owner reply"
          : report.targetType === "direct_message"
            ? "Direct message"
            : report.targetType === "review"
              ? "Review"
              : "Business";

      const preview =
        report.targetType === "review"
          ? review?.body ?? "Reported review no longer exists."
          : report.targetType === "owner_reply"
            ? ownerReply?.body ?? "Reported owner reply no longer exists."
            : report.targetType === "direct_message"
              ? directMessage?.message.body ?? "Reported message no longer exists."
              : business?.shortDescription ?? "Reported listing";

      const owner =
        business?.ownerUserId ? database.users.find((entry) => entry.id === business.ownerUserId) ?? null : null;

      return {
        ...report,
        business,
        reporter,
        owner,
        review: review ?? reviewForMessage,
        ownerReply,
        directMessage: directMessage?.message ?? null,
        thread: directMessage?.thread ?? null,
        targetTypeLabel,
        preview,
        contentStatus
      };
    });
}

async function getAdminBaseData() {
  const database = await readDatabase();
  const claims = database.businessClaims
    .slice()
    .sort((left, right) => {
      const leftTimestamp = left.reviewedAt ?? left.createdAt;
      const rightTimestamp = right.reviewedAt ?? right.createdAt;
      return leftTimestamp < rightTimestamp ? 1 : -1;
    })
    .map((claim) => {
      const business = database.businesses.find((entry) => entry.id === claim.businessId) ?? null;
      const category = business
        ? database.categories.find((entry) => entry.id === business.categoryId)?.name ?? "Unknown"
        : "Unknown";
      const neighborhood = business
        ? database.neighborhoods.find((entry) => entry.id === business.neighborhoodId)?.name ?? "Unknown"
        : "Unknown";
      const claimant = database.users.find((user) => user.id === claim.userId) ?? null;
      const reviewer = claim.reviewedByUserId
        ? database.users.find((user) => user.id === claim.reviewedByUserId) ?? null
        : null;

      return {
        ...claim,
        business,
        category,
        neighborhood,
        claimant,
        reviewer,
        statusView: mapClaimStatusToView(claim.status),
        statusLabel: formatClaimStatusLabel(claim.status),
        activityTimestamp: claim.reviewedAt ?? claim.createdAt
      };
    });

  const claimedBusinessesCount = database.businesses.filter((business) => Boolean(business.ownerUserId)).length;
  const neighborhoodCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const claim of claims) {
    incrementCount(neighborhoodCounts, claim.neighborhood);
    incrementCount(categoryCounts, claim.category);
  }

  const pendingClaims = claims.filter((claim) => claim.status === "pending");
  const reviewedClaims = claims.filter((claim) => claim.status !== "pending");
  const oldestPendingClaim = pendingClaims.reduce<typeof pendingClaims[number] | null>((oldest, claim) => {
    if (!oldest) {
      return claim;
    }

    return Date.parse(claim.createdAt) < Date.parse(oldest.createdAt) ? claim : oldest;
  }, null);

  const moderationEntries = buildModerationEntries(database);
  const openModerationEntries = moderationEntries.filter((entry) => entry.status === "open");
  const complaintCounts = new Map<string, number>();

  for (const entry of moderationEntries) {
    incrementCount(complaintCounts, entry.business?.name ?? "Unknown business");
  }

  const responsePressure = database.businesses
    .filter((business) => Boolean(business.ownerUserId))
    .map((business) => {
      const owner = database.users.find((user) => user.id === business.ownerUserId) ?? null;
      const pendingResponses = database.reviews.filter(
        (review) =>
          review.businessId === business.id &&
          review.status === "published" &&
          !database.ownerReviewReplies.some((reply) => reply.reviewId === review.id && reply.status === "active")
      ).length;

      return {
        id: business.id,
        businessName: business.name,
        ownerName: owner?.displayName ?? "Unknown owner",
        pendingResponses
      };
    })
    .filter((entry) => entry.pendingResponses > 0)
    .sort((left, right) => right.pendingResponses - left.pendingResponses || left.businessName.localeCompare(right.businessName))
    .slice(0, 5);

  const engagementLeaders = database.businesses
    .map((business) => ({
      id: business.id,
      name: business.name,
      recentViews: database.engagementEvents.filter(
        (event) =>
          event.businessId === business.id &&
          event.type === "page_view" &&
          isWithinLastThirtyDays(event.createdAt)
      ).length,
      recentSaves: database.saves.filter(
        (save) => save.businessId === business.id && isWithinLastThirtyDays(save.createdAt)
      ).length
    }))
    .sort(
      (left, right) =>
        right.recentViews - left.recentViews ||
        right.recentSaves - left.recentSaves ||
        left.name.localeCompare(right.name)
    )
    .slice(0, 5);

  return {
    database,
    claims,
    pendingClaims,
    reviewedClaims,
    moderationEntries,
    openModerationEntries,
    stats: {
      total: claims.length,
      pending: pendingClaims.length,
      approved: claims.filter((claim) => claim.status === "approved").length,
      rejected: claims.filter((claim) => claim.status === "rejected").length,
      suspended: claims.filter((claim) => claim.status === "superseded").length
    },
    moderationStats: {
      totalReports: moderationEntries.length,
      openReports: openModerationEntries.length,
      resolvedReports: moderationEntries.filter((entry) => entry.status === "resolved").length,
      dismissedReports: moderationEntries.filter((entry) => entry.status === "dismissed").length
    },
    queueInsights: {
      totalBusinesses: database.businesses.length,
      claimedBusinesses: claimedBusinessesCount,
      unownedBusinesses: database.businesses.length - claimedBusinessesCount,
      oldestPendingDays: oldestPendingClaim
        ? Math.max(0, Math.floor((Date.now() - Date.parse(oldestPendingClaim.createdAt)) / 86_400_000))
        : null,
      topNeighborhood: getTopCountEntry(neighborhoodCounts),
      topCategory: getTopCountEntry(categoryCounts),
      topComplaintBusiness: getTopCountEntry(complaintCounts)
    },
    responsePressure,
    engagementLeaders
  };
}

export async function getAdminDashboardData() {
  const base = await getAdminBaseData();

  return {
    stats: base.stats,
    moderationStats: base.moderationStats,
    queueInsights: base.queueInsights,
    recentActivity: base.claims.slice(0, 5),
    pendingPreview: base.pendingClaims.slice(0, 5),
    reviewedPreview: base.reviewedClaims.slice(0, 5),
    moderationPreview: base.openModerationEntries.slice(0, 5),
    responsePressure: base.responsePressure,
    engagementLeaders: base.engagementLeaders
  };
}

export async function getAdminClaimsListData(options: {
  view: AdminClaimView;
  query?: string;
  page?: number;
}) {
  const base = await getAdminBaseData();
  const filteredClaims = base.claims.filter((claim) => {
    const matchesView = options.view === "all" ? true : claim.statusView === options.view;
    const matchesSearch = matchesQuery(
      [
        claim.business?.name ?? "",
        claim.claimantName,
        claim.claimantEmail,
        claim.neighborhood,
        claim.category
      ],
      options.query
    );

    return matchesView && matchesSearch;
  });

  return {
    stats: base.stats,
    view: options.view,
    query: options.query ?? "",
    ...paginate(filteredClaims, options.page ?? 1)
  };
}

export async function getAdminClaimDetailData(claimId: string) {
  const base = await getAdminBaseData();
  const claim = base.claims.find((item) => item.id === claimId);

  if (!claim) {
    notFound();
  }

  const competingClaims = base.claims
    .filter((item) => item.businessId === claim.businessId && item.id !== claim.id)
    .slice(0, 5);

  return {
    claim,
    competingClaims,
    stats: base.stats
  };
}

export async function getAdminActivityData(options: {
  query?: string;
  status?: AdminClaimView;
  page?: number;
}) {
  const base = await getAdminBaseData();
  const filteredActivity = base.pendingClaims.filter((claim) => {
    const matchesStatus =
      !options.status || options.status === "all" ? true : claim.statusView === options.status;
    const matchesSearch = matchesQuery(
      [claim.business?.name ?? "", claim.claimantName, claim.neighborhood, claim.category],
      options.query
    );

    return matchesStatus && matchesSearch;
  });

  return {
    stats: base.stats,
    status: options.status ?? "all",
    query: options.query ?? "",
    ...paginate(filteredActivity, options.page ?? 1)
  };
}

export async function getAdminDecisionsData(options: {
  query?: string;
  status?: Exclude<AdminClaimView, "all" | "pending">;
  page?: number;
}) {
  const base = await getAdminBaseData();
  const filteredDecisions = base.reviewedClaims.filter((claim) => {
    const matchesStatus = !options.status ? true : claim.statusView === options.status;
    const matchesSearch = matchesQuery(
      [claim.business?.name ?? "", claim.claimantName, claim.reviewer?.displayName ?? "", claim.neighborhood],
      options.query
    );

    return matchesStatus && matchesSearch;
  });

  return {
    stats: base.stats,
    status: options.status ?? "",
    query: options.query ?? "",
    ...paginate(filteredDecisions, options.page ?? 1)
  };
}

export async function getAdminToolsData() {
  const base = await getAdminBaseData();
  const allBusinesses = base.database.businesses
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((business) => ({
      id: business.id,
      name: business.name,
      createdAt: business.createdAt ?? "",
      featureCount: business.features?.length ?? 0,
      photoCount: business.photoUrls?.length ?? 0,
      categoryName:
        base.database.categories.find((category) => category.id === business.categoryId)?.name ?? "Unknown",
      neighborhoodName:
        base.database.neighborhoods.find((neighborhood) => neighborhood.id === business.neighborhoodId)?.name ??
        "Unknown",
      ownerName: business.ownerUserId
        ? base.database.users.find((user) => user.id === business.ownerUserId)?.displayName ?? "Unknown owner"
        : null
    }));

  return {
    stats: base.stats,
    queueInsights: base.queueInsights,
    allBusinesses,
    businesses: base.database.businesses
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((business) => ({
        id: business.id,
        name: business.name,
        ownerUserId: business.ownerUserId,
        ownerName: business.ownerUserId
          ? base.database.users.find((user) => user.id === business.ownerUserId)?.displayName ?? "Unknown owner"
          : null
      })),
    users: base.database.users
      .slice()
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .map((user) => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email
      }))
  };
}

export async function getAdminManagementData() {
  const base = await getAdminBaseData();
  const adminUsers = base.database.users.filter((user) => user.role === "admin");

  return {
    stats: base.stats,
    admins: adminUsers,
    users: base.database.users
      .slice()
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .map((user) => ({
        ...user,
        ownedListingCount: base.database.businesses.filter((business) => business.ownerUserId === user.id).length
      })),
    adminCounts: {
      admins: adminUsers.length,
      members: base.database.users.filter((user) => user.role === "member").length,
      owners: base.database.businesses.filter((business) => Boolean(business.ownerUserId)).length
    }
  };
}

export async function getAdminBusinessFormData() {
  const database = await readDatabase();

  return {
    categories: database.categories
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((category) => ({ id: category.id, name: category.name })),
    neighborhoods: database.neighborhoods
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((neighborhood) => ({ id: neighborhood.id, name: neighborhood.name })),
    existingBusinesses: database.businesses
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((business) => ({
        id: business.id,
        name: business.name,
        categoryId: business.categoryId,
        neighborhoodId: business.neighborhoodId,
        address: business.address,
        googleMapsUrl: business.googleMapsUrl ?? "",
        bannerImageUrl: business.bannerImageUrl ?? "",
        priceTier: business.priceTier,
        features: business.features ?? [],
        tags: business.tags,
        shortDescription: business.shortDescription,
        longDescription: business.longDescription,
        photoUrls: business.photoUrls ?? [],
        openingHours: business.openingHours ?? [],
        services: business.services ?? []
      }))
  };
}

export async function getAdminModerationData(options: {
  query?: string;
  status?: Report["status"] | "all";
  targetType?: ReportTargetType | "all";
  page?: number;
}) {
  const base = await getAdminBaseData();
  const filteredEntries = base.moderationEntries.filter((entry) => {
    const matchesStatus = !options.status || options.status === "all" ? true : entry.status === options.status;
    const matchesTarget =
      !options.targetType || options.targetType === "all" ? true : entry.targetType === options.targetType;
    const matchesSearch = matchesQuery(
      [
        entry.business?.name ?? "",
        entry.reporter?.displayName ?? "",
        entry.reason,
        entry.targetTypeLabel,
        entry.preview
      ],
      options.query
    );

    return matchesStatus && matchesTarget && matchesSearch;
  });

  return {
    moderationStats: base.moderationStats,
    queueInsights: base.queueInsights,
    status: options.status ?? "all",
    targetType: options.targetType ?? "all",
    query: options.query ?? "",
    ...paginate(filteredEntries, options.page ?? 1)
  };
}

function resolveMatchingReports(
  reports: Report[],
  targetType: ReportTargetType,
  targetId: string,
  actor: AppActor,
  resolution: Report["resolution"],
  note?: string,
  status: Report["status"] = "resolved"
) {
  const now = new Date().toISOString();

  return reports.map((entry) =>
    entry.targetType === targetType && entry.targetId === targetId && entry.status === "open"
      ? {
          ...entry,
          status,
          resolution,
          resolvedAt: now,
          resolvedByUserId: actor.userId!,
          resolutionNote: note || undefined
        }
      : entry
  );
}

function sendModerationNotification(
  current: Awaited<ReturnType<typeof readDatabase>>,
  userId: string | undefined,
  actor: AppActor,
  title: string,
  body: string,
  actionHref = "/notifications"
) {
  if (!userId) {
    return;
  }

  queueNotifications(current, [userId], {
    kind: "moderation_update",
    title,
    body,
    actionHref,
    actionLabel: "Open notifications",
    senderUserId: actor.userId!
  });
}

export async function updateModerationReport(reportId: string, input: unknown, actor: AppActor) {
  assertIsAdmin(actor);
  const payload = moderationActionSchema.parse(input);

  await updateDatabase((current) => {
    const report = current.reports.find((entry) => entry.id === reportId);
    if (!report) {
      throw new Error("Report not found.");
    }

    const note = payload.note?.trim() || undefined;

    if (payload.action === "dismiss") {
      current.reports = resolveMatchingReports(
        current.reports,
        report.targetType,
        report.targetId,
        actor,
        "dismissed",
        note,
        "dismissed"
      );
      return current;
    }

    if (payload.action === "remove_content") {
      if (report.targetType === "review") {
        const review = current.reviews.find((entry) => entry.id === report.targetId);
        current.reviews = current.reviews.map((review) =>
          review.id === report.targetId
            ? {
                ...review,
                status: "removed"
              }
            : review
        );
        sendModerationNotification(
          current,
          review?.authorId,
          actor,
          "Your review was removed",
          `Dear ${review?.authorName ?? "member"}, your review was removed for ${report.reason.toLowerCase()}.${note ? ` Note: ${note}` : ""}`
        );
      } else if (report.targetType === "owner_reply") {
        const ownerReply = current.ownerReviewReplies.find((entry) => entry.id === report.targetId);
        const owner = ownerReply
          ? current.users.find((user) => user.id === ownerReply.ownerUserId)
          : null;
        current.ownerReviewReplies = current.ownerReviewReplies.map((reply) =>
          reply.id === report.targetId
            ? {
                ...reply,
                status: "removed",
                updatedAt: new Date().toISOString()
              }
            : reply
        );
        sendModerationNotification(
          current,
          ownerReply?.ownerUserId,
          actor,
          "Your owner reply was removed",
          `Dear ${owner?.displayName ?? "owner"}, your owner reply was removed for ${report.reason.toLowerCase()}.${note ? ` Note: ${note}` : ""}`
        );
      } else if (report.targetType === "direct_message") {
        const directMessage = findDirectMessage(current, report.targetId);
        const sender = directMessage
          ? current.users.find((user) => user.id === directMessage.message.senderUserId)
          : null;
        current.reviewDirectThreads = current.reviewDirectThreads.map((thread) => ({
          ...thread,
          messages: thread.messages.map((message) =>
            message.id === report.targetId
              ? {
                  ...message,
                  status: "removed"
                }
              : message
          )
        }));
        sendModerationNotification(
          current,
          directMessage?.message.senderUserId,
          actor,
          "Your private message was removed",
          `Dear ${sender?.displayName ?? "member"}, your private message was removed for ${report.reason.toLowerCase()}.${note ? ` Note: ${note}` : ""}`
        );
      } else {
        throw new Error("This report type cannot remove public content.");
      }

      current.reports = resolveMatchingReports(
        current.reports,
        report.targetType,
        report.targetId,
        actor,
        "content_removed",
        note
      );
      return current;
    }

    if (payload.action === "restore_content") {
      if (report.targetType === "review") {
        const review = current.reviews.find((entry) => entry.id === report.targetId);
        current.reviews = current.reviews.map((review) =>
          review.id === report.targetId
            ? {
                ...review,
                status: "published"
              }
            : review
        );
        sendModerationNotification(
          current,
          review?.authorId,
          actor,
          "Your review was restored",
          `Dear ${review?.authorName ?? "member"}, your review has been restored and is visible again.${note ? ` Note: ${note}` : ""}`
        );
      } else if (report.targetType === "owner_reply") {
        const ownerReply = current.ownerReviewReplies.find((entry) => entry.id === report.targetId);
        const owner = ownerReply
          ? current.users.find((user) => user.id === ownerReply.ownerUserId)
          : null;
        current.ownerReviewReplies = current.ownerReviewReplies.map((reply) =>
          reply.id === report.targetId
            ? {
                ...reply,
                status: "active",
                updatedAt: new Date().toISOString()
              }
            : reply
        );
        sendModerationNotification(
          current,
          ownerReply?.ownerUserId,
          actor,
          "Your owner reply was restored",
          `Dear ${owner?.displayName ?? "owner"}, your owner reply has been restored.${note ? ` Note: ${note}` : ""}`
        );
      } else if (report.targetType === "direct_message") {
        const directMessage = findDirectMessage(current, report.targetId);
        const sender = directMessage
          ? current.users.find((user) => user.id === directMessage.message.senderUserId)
          : null;
        current.reviewDirectThreads = current.reviewDirectThreads.map((thread) => ({
          ...thread,
          messages: thread.messages.map((message) =>
            message.id === report.targetId
              ? {
                  ...message,
                  status: "active"
                }
              : message
          )
        }));
        sendModerationNotification(
          current,
          directMessage?.message.senderUserId,
          actor,
          "Your private message was restored",
          `Dear ${sender?.displayName ?? "member"}, your private message has been restored.${note ? ` Note: ${note}` : ""}`
        );
      } else {
        throw new Error("This report type cannot be restored.");
      }

      current.reports = resolveMatchingReports(
        current.reports,
        report.targetType,
        report.targetId,
        actor,
        "content_restored",
        note
      );
      return current;
    }

    if (payload.action === "close_thread") {
      if (report.targetType !== "direct_message") {
        throw new Error("Only direct message reports can close a thread.");
      }

      const directMessage = findDirectMessage(current, report.targetId);
      if (!directMessage) {
        throw new Error("Thread not found.");
      }

      current.reviewDirectThreads = current.reviewDirectThreads.map((thread) =>
        thread.id === directMessage.thread.id
          ? {
              ...thread,
              status: "closed",
              updatedAt: new Date().toISOString()
            }
          : thread
      );
      current.reports = resolveMatchingReports(
        current.reports,
        report.targetType,
        report.targetId,
        actor,
        "thread_closed",
        note
      );
      return current;
    }

    const business = current.businesses.find((entry) => entry.id === report.businessId);
    if (!business) {
      throw new Error("Business not found.");
    }

    const owner = business.ownerUserId
      ? current.users.find((user) => user.id === business.ownerUserId)
      : null;
    current.businesses = current.businesses.map((entry) =>
      entry.id === business.id
        ? {
            ...entry,
            ownerMessagingDisabledAt: new Date().toISOString(),
            ownerMessagingDisabledReason: note ?? `Suspended from report ${report.id}`
          }
        : entry
    );
    sendModerationNotification(
      current,
      business.ownerUserId,
      actor,
      "Owner messaging has been suspended",
      `Dear ${owner?.displayName ?? "owner"}, private owner messaging for ${business.name} has been suspended.${note ? ` Reason: ${note}` : ""}`
    );
    current.reports = resolveMatchingReports(
      current.reports,
      report.targetType,
      report.targetId,
      actor,
      "owner_messaging_suspended",
      note
    );

    return current;
  });

  const database = await readDatabase();
  return database.reports.find((entry) => entry.id === reportId) ?? null;
}

export async function updateAdminUserRole(userId: string, input: unknown, actor: AppActor) {
  assertIsAdmin(actor);
  const payload = adminRoleUpdateSchema.parse(input);

  await updateDatabase((current) => {
    const targetUser = current.users.find((user) => user.id === userId);
    if (!targetUser) {
      throw new Error("User not found.");
    }

    if (targetUser.role === "admin" && payload.role === "member") {
      const adminCount = current.users.filter((user) => user.role === "admin").length;
      if (adminCount <= 1) {
        throw new Error("At least one admin must remain.");
      }
    }

    current.users = current.users.map((user) =>
      user.id === userId
        ? {
            ...user,
            role: payload.role,
            updatedAt: new Date().toISOString()
          }
        : user
    );

    queueNotifications(current, [targetUser.id], {
      kind: "admin_role_updated",
      title: payload.role === "admin" ? "Admin access granted" : "Admin access removed",
      body:
        payload.role === "admin"
          ? "Your account can now access the admin console."
          : "Your account no longer has admin console access.",
      actionHref: payload.role === "admin" ? "/admin/dashboard" : "/profile",
      actionLabel: payload.role === "admin" ? "Open admin" : "Open profile",
      senderUserId: actor.userId!
    });

    return current;
  });

  const database = await readDatabase();
  return database.users.find((user) => user.id === userId) ?? null;
}

export async function assignBusinessOwner(input: unknown, actor: AppActor) {
  assertIsAdmin(actor);
  const payload = ownerAssignmentSchema.parse(input);

  await updateDatabase((current) => {
    const business = current.businesses.find((entry) => entry.id === payload.businessId);
    if (!business) {
      throw new Error("Business not found.");
    }

    const user = current.users.find((entry) => entry.id === payload.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    current.businesses = current.businesses.map((entry) =>
      entry.id === business.id
        ? {
            ...entry,
            ownerUserId: user.id,
            claimedAt: entry.claimedAt ?? new Date().toISOString()
          }
        : entry
    );

    queueNotifications(current, [user.id], {
      kind: "ownership_assigned",
      title: `Owner access granted for ${business.name}`,
      body: "This account can now manage the listing, reply to reviews, and follow up privately with reviewers.",
      actionHref: "/owner",
      actionLabel: "Open owner dashboard",
      senderUserId: actor.userId!
    });

    return current;
  });

  const database = await readDatabase();
  return database.businesses.find((business) => business.id === payload.businessId) ?? null;
}
