import { z } from "zod";

import type { Business, BusinessClaim } from "@/features/businesses/types";
import type { AppActor } from "@/server/auth/actor";
import { assertAuthenticated, assertIsAdmin } from "@/server/auth/policies";
import { readDatabase, updateDatabase } from "@/server/database";

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

export const createClaimSchema = z.object({
  businessId: z.string().min(1),
  claimantName: z.string().trim().min(2).max(80),
  claimantPhone: z.string().trim().max(40).optional().or(z.literal("")),
  proofText: z.string().trim().max(1000).default(""),
  proofFileUrls: z.array(z.string().min(1)).max(1).default([])
}).superRefine((payload, context) => {
  if (payload.proofText.trim().length >= 20 || payload.proofFileUrls.length > 0) {
    return;
  }

  context.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Add at least 20 characters of proof details or upload a proof file.",
    path: ["proofText"]
  });
});

export const reviewClaimSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  adminNote: z.string().trim().max(500).optional().or(z.literal(""))
});

export async function submitClaim(input: unknown, actor: AppActor) {
  assertAuthenticated(actor);
  const payload = createClaimSchema.parse(input);
  const database = await readDatabase();
  const business = database.businesses.find((entry) => entry.id === payload.businessId);
  const user = database.users.find((entry) => entry.id === actor.userId);

  if (!business) {
    throw new Error("Business not found.");
  }

  if (!user) {
    throw new Error("User not found.");
  }

  if (business.ownerUserId) {
    throw new Error("This business has already been claimed.");
  }

  const existingPendingClaim = database.businessClaims.find(
    (claim) =>
      claim.businessId === payload.businessId &&
      claim.userId === actor.userId &&
      claim.status === "pending"
  );

  if (existingPendingClaim) {
    throw new Error("You already have a pending claim for this business.");
  }

  const claim: BusinessClaim = {
    id: `claim_${crypto.randomUUID()}`,
    businessId: payload.businessId,
    userId: actor.userId!,
    claimantName: payload.claimantName.trim(),
    claimantEmail: user.email,
    claimantPhone: payload.claimantPhone?.trim() || undefined,
    proofText: payload.proofText.trim(),
    proofFileUrls: payload.proofFileUrls,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  await updateDatabase((current) => ({
    ...current,
    businessClaims: [claim, ...current.businessClaims]
  }));

  return claim;
}

export async function getClaimPageData(userId: string) {
  const database = await readDatabase();
  const user = database.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    viewer: {
      displayName: user.displayName,
      email: user.email
    },
    businesses: database.businesses
      .filter((business) => !business.ownerUserId)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((business) => ({
        ...business,
        neighborhood:
          database.neighborhoods.find((item) => item.id === business.neighborhoodId)?.name ?? "Unknown",
        category: database.categories.find((item) => item.id === business.categoryId)?.name ?? "Unknown"
      })),
    existingClaims: database.businessClaims
      .filter((claim) => claim.userId === userId)
      .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
      .map((claim) => ({
        ...claim,
        business: (() => {
          const business = database.businesses.find((entry) => entry.id === claim.businessId);

          if (!business) {
            return null;
          }

          return {
            ...business,
            neighborhood:
              database.neighborhoods.find((item) => item.id === business.neighborhoodId)?.name ?? "Unknown",
            category: database.categories.find((item) => item.id === business.categoryId)?.name ?? "Unknown"
          };
        })()
      }))
  };
}

export async function getAdminClaimsPageData() {
  const database = await readDatabase();
  const claims = database.businessClaims
    .slice()
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .map((claim) => ({
      ...claim,
      business: (() => {
        const business = database.businesses.find((entry) => entry.id === claim.businessId);

        if (!business) {
          return null;
        }

        return {
          ...business,
          neighborhood:
            database.neighborhoods.find((item) => item.id === business.neighborhoodId)?.name ?? "Unknown",
          category: database.categories.find((item) => item.id === business.categoryId)?.name ?? "Unknown"
        };
      })(),
      claimant: database.users.find((user) => user.id === claim.userId) ?? null,
      reviewer: claim.reviewedByUserId
        ? database.users.find((user) => user.id === claim.reviewedByUserId) ?? null
        : null
    }));

  const pendingClaims = claims.filter((claim) => claim.status === "pending");
  const reviewedClaims = claims.filter((claim) => claim.status !== "pending");
  const claimedBusinessesCount = database.businesses.filter((business) => Boolean(business.ownerUserId)).length;
  const neighborhoodCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const claim of claims) {
    if (claim.business?.neighborhood) {
      incrementCount(neighborhoodCounts, claim.business.neighborhood);
    }

    if (claim.business?.category) {
      incrementCount(categoryCounts, claim.business.category);
    }
  }

  const oldestPendingClaim = pendingClaims.reduce<typeof pendingClaims[number] | null>((oldest, claim) => {
    if (!oldest) {
      return claim;
    }

    return Date.parse(claim.createdAt) < Date.parse(oldest.createdAt) ? claim : oldest;
  }, null);

  return {
    stats: {
      total: claims.length,
      pending: pendingClaims.length,
      approved: claims.filter((claim) => claim.status === "approved").length,
      rejected: claims.filter((claim) => claim.status === "rejected").length,
      superseded: claims.filter((claim) => claim.status === "superseded").length
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
      recentActivity: claims.slice(0, 4).map((claim) => ({
        id: claim.id,
        status: claim.status,
        businessName: claim.business?.name ?? "Unknown business",
        area: claim.business?.neighborhood ?? "Unknown area",
        claimantName: claim.claimantName,
        timestamp: claim.reviewedAt ?? claim.createdAt
      }))
    },
    referenceData: {
      categories: database.categories
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((category) => ({ id: category.id, name: category.name })),
      neighborhoods: database.neighborhoods
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((neighborhood) => ({ id: neighborhood.id, name: neighborhood.name })),
      businesses: database.businesses
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
    },
    pendingClaims,
    reviewedClaims
  };
}

export async function reviewClaim(claimId: string, input: unknown, actor: AppActor) {
  assertIsAdmin(actor);
  const payload = reviewClaimSchema.parse(input);
  let updatedClaim: BusinessClaim | null = null;

  await updateDatabase((current) => {
    const targetClaim = current.businessClaims.find((claim) => claim.id === claimId);
    if (!targetClaim) {
      throw new Error("Claim not found.");
    }

    const business = current.businesses.find((entry) => entry.id === targetClaim.businessId);
    if (!business) {
      throw new Error("Business not found.");
    }

    if (payload.decision === "approved" && business.ownerUserId && business.ownerUserId !== targetClaim.userId) {
      throw new Error("This business already has an owner.");
    }

    const now = new Date().toISOString();

    const nextClaims: BusinessClaim[] = current.businessClaims.map((claim) => {
      if (claim.id === claimId) {
        updatedClaim = {
          ...claim,
          status: payload.decision,
          adminNote: payload.adminNote || undefined,
          reviewedAt: now,
          reviewedByUserId: actor.userId!
        };

        return updatedClaim;
      }

      if (
        payload.decision === "approved" &&
        claim.businessId === targetClaim.businessId &&
        claim.status === "pending"
      ) {
        return {
          ...claim,
          status: "superseded",
          reviewedAt: now,
          reviewedByUserId: actor.userId!,
          adminNote: claim.adminNote ?? "Superseded by an approved claim."
        };
      }

      return claim;
    });

    const nextBusinesses: Business[] =
      payload.decision === "approved"
        ? current.businesses.map((businessEntry) =>
            businessEntry.id === targetClaim.businessId
              ? {
                  ...businessEntry,
                  ownerUserId: targetClaim.userId,
                  claimedAt: now
                }
              : businessEntry
          )
        : current.businesses;

    return {
      ...current,
      businesses: nextBusinesses,
      businessClaims: nextClaims
    };
  });

  if (!updatedClaim) {
    throw new Error("Claim not found.");
  }

  return updatedClaim;
}
