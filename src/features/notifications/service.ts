import { z } from "zod";

import type { AppDatabase, NotificationKind, UserNotification } from "@/features/businesses/types";
import type { AppActor } from "@/server/auth/actor";
import { assertAuthenticated, assertIsAdmin } from "@/server/auth/policies";
import { readDatabase, updateDatabase } from "@/server/database";

const adminBroadcastSchema = z.object({
  audience: z.enum(["all", "members", "owners", "admins", "single"]),
  userId: z.string().trim().optional().or(z.literal("")),
  title: z.string().trim().min(4).max(80),
  body: z.string().trim().min(8).max(500),
  actionHref: z.string().trim().max(200).optional().or(z.literal("")),
  actionLabel: z.string().trim().max(40).optional().or(z.literal(""))
}).superRefine((payload, context) => {
  if (payload.audience === "single" && !payload.userId?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose a user when sending a single-user message.",
      path: ["userId"]
    });
  }
});

type NotificationDraft = {
  kind: NotificationKind;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  senderUserId?: string;
};

function dedupeUserIds(userIds: string[]) {
  return Array.from(new Set(userIds.filter(Boolean)));
}

export function queueNotifications(
  database: AppDatabase,
  userIds: string[],
  draft: NotificationDraft,
  createdAt = new Date().toISOString()
) {
  const notifications: UserNotification[] = dedupeUserIds(userIds).map((userId) => ({
    id: `notification_${crypto.randomUUID()}`,
    userId,
    kind: draft.kind,
    title: draft.title,
    body: draft.body,
    status: "unread",
    createdAt,
    readAt: undefined,
    actionHref: draft.actionHref,
    actionLabel: draft.actionLabel,
    senderUserId: draft.senderUserId
  }));

  if (notifications.length > 0) {
    database.notifications = [...notifications, ...database.notifications];
  }

  return notifications;
}

function selectAudienceUserIds(database: AppDatabase, audience: "all" | "members" | "owners" | "admins") {
  if (audience === "admins") {
    return database.users.filter((user) => user.role === "admin").map((user) => user.id);
  }

  if (audience === "owners") {
    const ownerIds = new Set(
      database.businesses.filter((business) => business.ownerUserId).map((business) => business.ownerUserId!)
    );
    return Array.from(ownerIds);
  }

  if (audience === "members") {
    const ownerIds = new Set(
      database.businesses.filter((business) => business.ownerUserId).map((business) => business.ownerUserId!)
    );
    return database.users
      .filter((user) => user.role !== "admin" && !ownerIds.has(user.id))
      .map((user) => user.id);
  }

  return database.users.map((user) => user.id);
}

export async function sendAdminBroadcast(input: unknown, actor: AppActor) {
  assertIsAdmin(actor);
  const payload = adminBroadcastSchema.parse(input);
  let createdCount = 0;

  await updateDatabase((current) => {
    const recipients =
      payload.audience === "single"
        ? (() => {
            const user = current.users.find((entry) => entry.id === payload.userId?.trim());
            if (!user) {
              throw new Error("User not found for direct inbox message.");
            }

            return [user.id];
          })()
        : selectAudienceUserIds(current, payload.audience);
    createdCount = queueNotifications(
      current,
      recipients,
      {
        kind: "admin_broadcast",
        title: payload.title,
        body: payload.body,
        actionHref: payload.actionHref?.trim() || undefined,
        actionLabel: payload.actionLabel?.trim() || undefined,
        senderUserId: actor.userId!
      }
    ).length;

    return current;
  });

  return { createdCount };
}

export async function markNotificationRead(notificationId: string, actor: AppActor) {
  assertAuthenticated(actor);
  let updatedNotification: UserNotification | null = null;

  await updateDatabase((current) => {
    const notification = current.notifications.find(
      (entry) => entry.id === notificationId && entry.userId === actor.userId
    );

    if (!notification) {
      throw new Error("Notification not found.");
    }

    if (notification.status === "read") {
      updatedNotification = notification;
      return current;
    }

    const now = new Date().toISOString();
    current.notifications = current.notifications.map((entry) =>
      entry.id === notification.id
        ? {
            ...entry,
            status: "read",
            readAt: now
          }
        : entry
    );

    updatedNotification =
      current.notifications.find((entry) => entry.id === notification.id) ?? {
        ...notification,
        status: "read",
        readAt: now
      };

    return current;
  });

  if (!updatedNotification) {
    throw new Error("Notification not found.");
  }

  return updatedNotification;
}

export async function getAdminMessagesPageData() {
  const database = await readDatabase();
  const ownerIds = new Set(
    database.businesses.filter((business) => business.ownerUserId).map((business) => business.ownerUserId!)
  );
  const recentNotifications = database.notifications
    .slice()
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .slice(0, 16)
    .map((notification) => ({
      ...notification,
      recipient: database.users.find((user) => user.id === notification.userId) ?? null,
      sender: notification.senderUserId
        ? database.users.find((user) => user.id === notification.senderUserId) ?? null
        : null
    }));

  return {
    stats: {
      totalNotifications: database.notifications.length,
      unreadNotifications: database.notifications.filter((notification) => notification.status === "unread").length,
      members: database.users.filter((user) => user.role !== "admin" && !ownerIds.has(user.id)).length,
      owners: ownerIds.size
    },
    users: database.users
      .slice()
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .map((user) => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        isOwner: ownerIds.has(user.id)
      })),
    recentNotifications
  };
}

export async function getNotificationBellData(userId: string) {
  const database = await readDatabase();
  const notifications = database.notifications
    .filter((notification) => notification.userId === userId)
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .slice(0, 6)
    .map((notification) => ({
      ...notification,
      sender: notification.senderUserId
        ? database.users.find((user) => user.id === notification.senderUserId) ?? null
        : null,
      href: notification.actionHref || "/notifications"
    }));

  return {
    unreadCount: database.notifications.filter(
      (notification) => notification.userId === userId && notification.status === "unread"
    ).length,
    notifications
  };
}
