import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { BUSINESS_FEATURE_OPTIONS } from "@/features/businesses/catalog";
import { buildSeedDatabase } from "@/features/businesses/seed";
import type {
  AppDatabase,
  Business,
  BusinessEngagementEvent,
  BusinessClaim,
  Category,
  Neighborhood,
  OwnerReviewReply,
  Report,
  Review,
  ReviewDirectThread,
  Save,
  UserNotification,
  User
} from "@/features/businesses/types";
import { syncAllBusinessMetrics } from "@/features/businesses/logic";
import { demoUsers } from "@/server/auth/seed-users";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "app-db.json");
let writeQueue: Promise<void> = Promise.resolve();
let updateQueue: Promise<unknown> = Promise.resolve();

type LegacyReview = Omit<Review, "authorId" | "updatedAt" | "photoUrls" | "tags">;
type LegacySave = Omit<Save, "userId"> & {
  viewerId: string;
};
type LegacyReport = Omit<Report, "userId" | "targetType" | "targetId"> & {
  viewerId?: string;
  reviewId?: string;
};
type LegacyBusinessClaim = Omit<BusinessClaim, "proofFileUrls" | "claimantPhone"> & {
  claimantPhone?: string;
  proofFileUrls?: string[];
};

type RawDatabase = {
  categories?: Category[];
  neighborhoods?: Neighborhood[];
  businesses?: Business[];
  reviews?: Array<Review | LegacyReview>;
  saves?: Array<Save | LegacySave>;
  reports?: Array<Report | LegacyReport>;
  engagementEvents?: BusinessEngagementEvent[];
  ownerReviewReplies?: OwnerReviewReply[];
  reviewDirectThreads?: ReviewDirectThread[];
  users?: User[];
  businessClaims?: Array<BusinessClaim | LegacyBusinessClaim>;
  notifications?: UserNotification[];
};

function mergeById<T extends { id: string }>(...collections: T[][]) {
  const merged = new Map<string, T>();

  for (const collection of collections) {
    for (const item of collection) {
      merged.set(item.id, item);
    }
  }

  return Array.from(merged.values());
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

function createMigratedUser(displayName: string, index: number): User {
  const stamp = "2026-03-16T12:00:00.000Z";

  return {
    id: `user-migrated-${index + 1}`,
    email: `migrated-${slugify(displayName || "reviewer")}-${index + 1}@addisbeakal.test`,
    passwordHash: demoUsers[0].passwordHash,
    displayName: displayName || `Migrated User ${index + 1}`,
    role: "member",
    createdAt: stamp,
    updatedAt: stamp
  };
}

function mergeDemoUsers(users: User[]) {
  const nextUsers = [...users];

  for (const demoUser of demoUsers) {
    if (!nextUsers.some((user) => user.email === demoUser.email)) {
      nextUsers.push(demoUser);
    }
  }

  return nextUsers;
}

function normalizeUsers(rawUsers: User[] | undefined, reviews: Array<Review | LegacyReview>) {
  const nextUsers = rawUsers ? [...rawUsers] : [];
  const authorIdByName = new Map<string, string>();

  for (const user of nextUsers) {
    authorIdByName.set(user.displayName, user.id);
  }

  let migratedIndex = 0;
  for (const review of reviews) {
    if ("authorId" in review && review.authorId) {
      continue;
    }

    if (authorIdByName.has(review.authorName)) {
      continue;
    }

    const user = createMigratedUser(review.authorName, migratedIndex);
    migratedIndex += 1;
    nextUsers.push(user);
    authorIdByName.set(user.displayName, user.id);
  }

  return mergeDemoUsers(nextUsers);
}

function normalizeReviews(rawReviews: Array<Review | LegacyReview>, users: User[]): Review[] {
  return rawReviews.map((review) => {
    if ("authorId" in review && "updatedAt" in review && "photoUrls" in review) {
      return {
        ...review,
        photoUrls: review.photoUrls ?? [],
        tags: "tags" in review ? review.tags ?? [] : []
      };
    }

    const matchedUser =
      users.find((user) => user.displayName === review.authorName) ?? createMigratedUser(review.authorName, 0);

    return {
      ...review,
      authorId: matchedUser.id,
      updatedAt: review.createdAt,
      photoUrls: [],
      tags: []
    };
  });
}

function normalizeSaves(rawSaves: Array<Save | LegacySave> | undefined): Save[] {
  if (!rawSaves) {
    return [];
  }

  return rawSaves
    .filter((save): save is Save => "userId" in save && Boolean(save.userId))
    .map((save) => ({
      id: save.id,
      businessId: save.businessId,
      userId: save.userId,
      createdAt: save.createdAt
    }));
}

function normalizeReports(rawReports: Array<Report | LegacyReport> | undefined): Report[] {
  if (!rawReports) {
    return [];
  }

  const normalizedReports: Report[] = [];

  for (const report of rawReports) {
    const userId = ("userId" in report ? report.userId : undefined) || ("viewerId" in report ? report.viewerId : undefined);
    if (!userId) {
      continue;
    }

    const targetType =
      "targetType" in report && report.targetType
        ? report.targetType
        : "reviewId" in report && report.reviewId
          ? "review"
          : "business";
    const targetId =
      "targetId" in report && report.targetId
        ? report.targetId
        : "reviewId" in report && report.reviewId
          ? report.reviewId
          : report.businessId;

    normalizedReports.push({
      id: report.id,
      businessId: report.businessId,
      userId,
      targetType,
      targetId,
      reason: report.reason,
      details: report.details,
      contactEmail: report.contactEmail,
      createdAt: report.createdAt,
      status: `${report.status}` === "triaged" ? "resolved" : report.status,
      resolution: "resolution" in report ? report.resolution : undefined,
      resolvedAt: "resolvedAt" in report ? report.resolvedAt : undefined,
      resolvedByUserId: "resolvedByUserId" in report ? report.resolvedByUserId : undefined,
      resolutionNote: "resolutionNote" in report ? report.resolutionNote : undefined
    });
  }

  return normalizedReports;
}

function normalizeEngagementEvents(rawEvents: BusinessEngagementEvent[] | undefined): BusinessEngagementEvent[] {
  return (rawEvents ?? []).map((event) => ({
    ...event,
    reviewId: event.reviewId,
    userId: event.userId
  }));
}

function normalizeOwnerReviewReplies(rawReplies: OwnerReviewReply[] | undefined): OwnerReviewReply[] {
  return (rawReplies ?? []).map((reply) => ({
    ...reply,
    status: reply.status ?? "active"
  }));
}

function normalizeReviewDirectThreads(rawThreads: ReviewDirectThread[] | undefined): ReviewDirectThread[] {
  return (rawThreads ?? []).map((thread) => ({
    ...thread,
    messages: thread.messages.map((message) => ({
      ...message,
      status: message.status ?? "active"
    }))
  }));
}

function normalizeBusinesses(rawBusinesses: Business[] | undefined): Business[] {
  const knownFeatures = new Set<string>(BUSINESS_FEATURE_OPTIONS);

  return (rawBusinesses ?? []).map((business) => ({
    ...business,
    features:
      business.features?.length
        ? business.features
        : business.tags.filter((tag) => knownFeatures.has(tag as (typeof BUSINESS_FEATURE_OPTIONS)[number])),
    tags: business.tags ?? [],
    googleMapsUrl: business.googleMapsUrl,
    bannerImageUrl: business.bannerImageUrl,
    photoUrls: business.photoUrls ?? [],
    openingHours: business.openingHours,
    services: business.services ?? [],
    viewCount: business.viewCount ?? 0,
    createdAt: business.createdAt,
    createdByUserId: business.createdByUserId,
    ownerUserId: business.ownerUserId,
    claimedAt: business.claimedAt,
    ownerMessagingDisabledAt: business.ownerMessagingDisabledAt,
    ownerMessagingDisabledReason: business.ownerMessagingDisabledReason
  }));
}

function normalizeNotifications(rawNotifications: UserNotification[] | undefined): UserNotification[] {
  return (rawNotifications ?? []).map((notification) => ({
    ...notification,
    status: notification.status ?? "unread",
    readAt: notification.readAt
  }));
}

function normalizeBusinessClaims(
  rawBusinessClaims: Array<BusinessClaim | LegacyBusinessClaim> | undefined
): BusinessClaim[] {
  if (!rawBusinessClaims) {
    return [];
  }

  return rawBusinessClaims.map((claim) => ({
    ...claim,
    claimantPhone: claim.claimantPhone,
    proofFileUrls: claim.proofFileUrls ?? []
  }));
}

function mergeBusinesses(seedBusinesses: Business[], currentBusinesses: Business[]) {
  const currentById = new Map(currentBusinesses.map((business) => [business.id, business]));
  const merged = seedBusinesses.map((seedBusiness) => {
    const currentBusiness = currentById.get(seedBusiness.id);

    if (!currentBusiness) {
      return seedBusiness;
    }

    return {
      ...seedBusiness,
      rating: currentBusiness.rating,
      reviewCount: currentBusiness.reviewCount,
      saveCount: currentBusiness.saveCount,
      viewCount: currentBusiness.viewCount,
      ownerUserId: currentBusiness.ownerUserId,
      claimedAt: currentBusiness.claimedAt,
      ownerMessagingDisabledAt: currentBusiness.ownerMessagingDisabledAt,
      ownerMessagingDisabledReason: currentBusiness.ownerMessagingDisabledReason
    };
  });

  const seededIds = new Set(seedBusinesses.map((business) => business.id));
  const extraBusinesses = currentBusinesses.filter((business) => !seededIds.has(business.id));

  return [...merged, ...extraBusinesses];
}

function normalizeDatabase(raw: RawDatabase): AppDatabase {
  const seed = buildSeedDatabase();
  const reviews = raw.reviews ?? [];
  const users = mergeDemoUsers(mergeById(seed.users, normalizeUsers(raw.users, reviews)));

  return syncAllBusinessMetrics({
    categories: mergeById(raw.categories ?? [], seed.categories),
    neighborhoods: mergeById(raw.neighborhoods ?? [], seed.neighborhoods),
    businesses: mergeBusinesses(seed.businesses, normalizeBusinesses(raw.businesses)),
    reviews: mergeById(seed.reviews, normalizeReviews(reviews, users)),
    saves: mergeById(seed.saves, normalizeSaves(raw.saves)),
    reports: mergeById(seed.reports, normalizeReports(raw.reports)),
    engagementEvents: mergeById(seed.engagementEvents, normalizeEngagementEvents(raw.engagementEvents)),
    ownerReviewReplies: mergeById(seed.ownerReviewReplies, normalizeOwnerReviewReplies(raw.ownerReviewReplies)),
    reviewDirectThreads: mergeById(seed.reviewDirectThreads, normalizeReviewDirectThreads(raw.reviewDirectThreads)),
    users,
    businessClaims: normalizeBusinessClaims(raw.businessClaims),
    notifications: mergeById(seed.notifications, normalizeNotifications(raw.notifications))
  });
}

async function ensureDatabaseFile() {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await readFile(DATA_FILE, "utf-8");
  } catch {
    await writeDatabase(buildSeedDatabase());
  }
}

export async function readDatabase() {
  await ensureDatabaseFile();
  const raw = JSON.parse(await readFile(DATA_FILE, "utf-8")) as RawDatabase;
  const normalized = normalizeDatabase(raw);

  if (JSON.stringify(raw) !== JSON.stringify(normalized)) {
    await writeDatabase(normalized);
  }

  return normalized;
}

export async function writeDatabase(database: AppDatabase) {
  const payload = JSON.stringify(database, null, 2);

  const pendingWrite = writeQueue.then(async () => {
    await mkdir(DATA_DIRECTORY, { recursive: true });
    const tempFile = `${DATA_FILE}.${process.pid}.${Date.now()}.${crypto.randomUUID()}.tmp`;
    await writeFile(tempFile, payload, "utf-8");
    await rename(tempFile, DATA_FILE);
  });

  writeQueue = pendingWrite.catch(() => undefined);
  await pendingWrite;
}

export async function updateDatabase(
  updater: (database: AppDatabase) => AppDatabase | Promise<AppDatabase>
) {
  const pendingUpdate = updateQueue.then(async () => {
    const current = await readDatabase();
    const next = await updater(current);
    await writeDatabase(syncAllBusinessMetrics(next));
    return next;
  });

  updateQueue = pendingUpdate.catch(() => undefined);
  return pendingUpdate as Promise<AppDatabase>;
}
