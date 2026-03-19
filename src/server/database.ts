import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildSeedDatabase } from "@/features/businesses/seed";
import type {
  AppDatabase,
  Business,
  BusinessClaim,
  Category,
  Neighborhood,
  Report,
  Review,
  Save,
  User
} from "@/features/businesses/types";
import { syncAllBusinessMetrics } from "@/features/businesses/logic";
import { demoUsers } from "@/server/auth/seed-users";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "app-db.json");

type LegacyReview = Omit<Review, "authorId" | "updatedAt" | "photoUrls">;
type LegacySave = Omit<Save, "userId"> & {
  viewerId: string;
};
type LegacyReport = Omit<Report, "userId"> & {
  viewerId?: string;
};

type RawDatabase = {
  categories?: Category[];
  neighborhoods?: Neighborhood[];
  businesses?: Business[];
  reviews?: Array<Review | LegacyReview>;
  saves?: Array<Save | LegacySave>;
  reports?: Array<Report | LegacyReport>;
  users?: User[];
  businessClaims?: BusinessClaim[];
};

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
        photoUrls: review.photoUrls ?? []
      };
    }

    const matchedUser =
      users.find((user) => user.displayName === review.authorName) ?? createMigratedUser(review.authorName, 0);

    return {
      ...review,
      authorId: matchedUser.id,
      updatedAt: review.createdAt,
      photoUrls: []
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

  return rawReports
    .filter((report): report is Report => "userId" in report && Boolean(report.userId))
    .map((report) => ({
      id: report.id,
      businessId: report.businessId,
      reviewId: report.reviewId,
      userId: report.userId,
      reason: report.reason,
      details: report.details,
      contactEmail: report.contactEmail,
      createdAt: report.createdAt,
      status: report.status
    }));
}

function normalizeBusinesses(rawBusinesses: Business[] | undefined): Business[] {
  return (rawBusinesses ?? []).map((business) => ({
    ...business,
    ownerUserId: business.ownerUserId,
    claimedAt: business.claimedAt
  }));
}

function normalizeDatabase(raw: RawDatabase): AppDatabase {
  const reviews = raw.reviews ?? [];
  const users = normalizeUsers(raw.users, reviews);

  return syncAllBusinessMetrics({
    categories: raw.categories ?? buildSeedDatabase().categories,
    neighborhoods: raw.neighborhoods ?? buildSeedDatabase().neighborhoods,
    businesses: normalizeBusinesses(raw.businesses),
    reviews: normalizeReviews(reviews, users),
    saves: normalizeSaves(raw.saves),
    reports: normalizeReports(raw.reports),
    users,
    businessClaims: raw.businessClaims ?? []
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
  await mkdir(DATA_DIRECTORY, { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  await writeFile(tempFile, JSON.stringify(database, null, 2), "utf-8");
  await rename(tempFile, DATA_FILE);
}

export async function updateDatabase(
  updater: (database: AppDatabase) => AppDatabase | Promise<AppDatabase>
) {
  const current = await readDatabase();
  const next = await updater(current);
  await writeDatabase(syncAllBusinessMetrics(next));
  return next;
}
