import type { AppActor } from "@/server/auth/actor";

export class AuthorizationError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

export function assertAuthenticated(actor: AppActor) {
  if (!actor.userId) {
    throw new AuthorizationError("Please sign in to continue.", 401);
  }
}

export function assertCanToggleSave(actor: AppActor) {
  assertAuthenticated(actor);
}

export function assertCanSubmitReport(actor: AppActor) {
  assertAuthenticated(actor);
}

export function assertCanCreateReview(actor: AppActor) {
  assertAuthenticated(actor);
}

export function assertCanUseOwnerTools(actor: AppActor) {
  assertAuthenticated(actor);

  if (actor.role !== "owner" && actor.role !== "admin") {
    throw new AuthorizationError("Owner access is required.", 403);
  }
}

export function assertIsAdmin(actor: AppActor) {
  if (!actor.userId) {
    throw new AuthorizationError("Please sign in to continue.", 401);
  }

  if (actor.role !== "admin") {
    throw new AuthorizationError("Admin access is required.", 403);
  }
}
