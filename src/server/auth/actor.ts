import type { User } from "@/features/businesses/types";

export type AppRole = "anonymous" | "member" | "owner" | "admin";

export type AppActor = {
  userId: string | null;
  role: AppRole;
  user: User | null;
};

export function createAnonymousActor(): AppActor {
  return {
    userId: null,
    role: "anonymous",
    user: null
  };
}

export function createAuthenticatedActor(user: User, isOwner: boolean): AppActor {
  return {
    userId: user.id,
    role: user.role === "admin" ? "admin" : isOwner ? "owner" : "member",
    user
  };
}
