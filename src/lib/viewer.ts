import { cookies } from "next/headers";

export const VIEWER_COOKIE = "beakal_viewer_id";

function createViewerId() {
  return `viewer_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getViewerId() {
  const cookieStore = await cookies();
  return cookieStore.get(VIEWER_COOKIE)?.value ?? null;
}

export async function ensureViewerId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VIEWER_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const viewerId = createViewerId();
  cookieStore.set(VIEWER_COOKIE, viewerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return viewerId;
}
