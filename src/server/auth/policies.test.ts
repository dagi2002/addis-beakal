import { describe, expect, it } from "vitest";

import { createAnonymousActor, createAuthenticatedActor } from "@/server/auth/actor";
import { assertCanSubmitReport, assertCanToggleSave, assertIsAdmin } from "@/server/auth/policies";

describe("viewer policies", () => {
  it("rejects anonymous users from saving businesses", () => {
    expect(() => assertCanToggleSave(createAnonymousActor())).toThrow("Please sign in");
  });

  it("allows signed-in members to submit reports", () => {
    expect(() =>
      assertCanSubmitReport(
        createAuthenticatedActor(
          {
            id: "user-1",
            email: "member@test.dev",
            passwordHash: "hash",
            displayName: "Member",
            role: "member",
            createdAt: "2026-03-16T12:00:00.000Z",
            updatedAt: "2026-03-16T12:00:00.000Z"
          },
          false
        )
      )
    ).not.toThrow();
  });

  it("rejects non-admins from admin routes", () => {
    expect(() =>
      assertIsAdmin(
        createAuthenticatedActor(
          {
            id: "user-1",
            email: "member@test.dev",
            passwordHash: "hash",
            displayName: "Member",
            role: "member",
            createdAt: "2026-03-16T12:00:00.000Z",
            updatedAt: "2026-03-16T12:00:00.000Z"
          },
          false
        )
      )
    ).toThrow("Admin access");
  });
});
