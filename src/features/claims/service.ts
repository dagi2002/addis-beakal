import { z } from "zod";

import type { Business, BusinessClaim } from "@/features/businesses/types";
import type { AppActor } from "@/server/auth/actor";
import { assertAuthenticated, assertIsAdmin } from "@/server/auth/policies";
import { readDatabase, updateDatabase } from "@/server/database";

export const createClaimSchema = z.object({
  businessId: z.string().min(1),
  relationship: z.string().trim().min(3).max(80),
  proofText: z.string().trim().min(20).max(1000)
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
    claimantName: user.displayName,
    claimantEmail: user.email,
    relationship: payload.relationship.trim(),
    proofText: payload.proofText.trim(),
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

  return {
    businesses: database.businesses
      .filter((business) => !business.ownerUserId)
      .sort((left, right) => left.name.localeCompare(right.name)),
    existingClaims: database.businessClaims
      .filter((claim) => claim.userId === userId)
      .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
      .map((claim) => ({
        ...claim,
        business: database.businesses.find((business) => business.id === claim.businessId) ?? null
      }))
  };
}

export async function getAdminClaimsPageData() {
  const database = await readDatabase();

  return database.businessClaims
    .slice()
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .map((claim) => ({
      ...claim,
      business: database.businesses.find((business) => business.id === claim.businessId) ?? null,
      claimant: database.users.find((user) => user.id === claim.userId) ?? null,
      reviewer: claim.reviewedByUserId
        ? database.users.find((user) => user.id === claim.reviewedByUserId) ?? null
        : null
    }));
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
