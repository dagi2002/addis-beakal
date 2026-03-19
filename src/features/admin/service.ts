import { notFound } from "next/navigation";

import type { ClaimStatus } from "@/features/businesses/types";
import { readDatabase } from "@/server/database";

export type AdminClaimView = "all" | "pending" | "approved" | "rejected" | "suspended";

const PAGE_SIZE = 10;

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

  return {
    database,
    claims,
    pendingClaims,
    reviewedClaims,
    stats: {
      total: claims.length,
      pending: pendingClaims.length,
      approved: claims.filter((claim) => claim.status === "approved").length,
      rejected: claims.filter((claim) => claim.status === "rejected").length,
      suspended: claims.filter((claim) => claim.status === "superseded").length
    },
    queueInsights: {
      totalBusinesses: database.businesses.length,
      claimedBusinesses: claimedBusinessesCount,
      unownedBusinesses: database.businesses.length - claimedBusinessesCount,
      oldestPendingDays: oldestPendingClaim
        ? Math.max(0, Math.floor((Date.now() - Date.parse(oldestPendingClaim.createdAt)) / 86_400_000))
        : null,
      topNeighborhood: getTopCountEntry(neighborhoodCounts),
      topCategory: getTopCountEntry(categoryCounts)
    }
  };
}

export async function getAdminDashboardData() {
  const base = await getAdminBaseData();

  return {
    stats: base.stats,
    queueInsights: base.queueInsights,
    recentActivity: base.claims.slice(0, 5),
    pendingPreview: base.pendingClaims.slice(0, 5),
    reviewedPreview: base.reviewedClaims.slice(0, 5)
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
  const filteredActivity = base.claims.filter((claim) => {
    const matchesStatus = !options.status || options.status === "all" ? true : claim.statusView === options.status;
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
  const recentBusinesses = base.database.businesses
    .slice()
    .sort((left, right) => (left.createdAt ?? "") < (right.createdAt ?? "") ? 1 : -1)
    .filter((business) => Boolean(business.createdAt))
    .slice(0, 8)
    .map((business) => ({
      id: business.id,
      name: business.name,
      createdAt: business.createdAt!,
      featureCount: business.features?.length ?? 0,
      photoCount: business.photoUrls?.length ?? 0
    }));

  return {
    stats: base.stats,
    queueInsights: base.queueInsights,
    recentBusinesses
  };
}

export async function getAdminManagementData() {
  const base = await getAdminBaseData();
  const adminUsers = base.database.users.filter((user) => user.role === "admin");

  return {
    stats: base.stats,
    admins: adminUsers,
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
