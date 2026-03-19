import { redirect } from "next/navigation";

import { createAnonymousActor, createAuthenticatedActor } from "@/server/auth/actor";
import { getSessionUserId } from "@/server/auth/session";
import { readDatabase } from "@/server/database";

export function buildLoginPath(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export async function getViewerId() {
  return getSessionUserId();
}

export async function getOptionalSessionUser() {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }

  const database = await readDatabase();
  return database.users.find((user) => user.id === userId) ?? null;
}

export async function getSessionActor() {
  const user = await getOptionalSessionUser();

  if (!user) {
    return createAnonymousActor();
  }

  const database = await readDatabase();
  const isOwner = database.businesses.some((business) => business.ownerUserId === user.id);

  return createAuthenticatedActor(user, isOwner);
}

export async function requireSessionActor(nextPath: string) {
  const actor = await getSessionActor();
  if (!actor.userId) {
    redirect(buildLoginPath(nextPath));
  }

  return actor;
}

export async function requireAdminActor(nextPath: string) {
  const actor = await requireSessionActor(nextPath);
  if (actor.role !== "admin") {
    redirect("/");
  }

  return actor;
}

export async function requireOwnerActor(nextPath: string) {
  const actor = await requireSessionActor(nextPath);
  if (actor.role !== "owner" && actor.role !== "admin") {
    redirect("/claim-business");
  }

  return actor;
}
