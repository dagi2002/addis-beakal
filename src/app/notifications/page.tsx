import Link from "next/link";

import { ReviewThreadCard } from "@/components/business/review-thread-card";
import { SiteShell } from "@/components/layout/site-shell";
import { NotificationReadButton } from "@/components/profile/notification-read-button";
import { getProfilePageData } from "@/features/profile/service";
import { requireSessionActor } from "@/lib/viewer";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export default async function NotificationsPage() {
  const actor = await requireSessionActor("/notifications");
  const data = await getProfilePageData(actor.userId!);

  return (
    <SiteShell className="gap-8">
      <section className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-9 sm:py-9">
        <div className="grain-overlay" />
        <div className="relative space-y-4 text-white">
          <p className="section-label text-white/72">Notifications</p>
          <h1 className="editorial-title max-w-3xl text-[clamp(2.7rem,5vw,4.7rem)] leading-[0.96] text-white">
            Messages, moderation updates, and owner follow-up in one inbox.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-white/82">
            Browse every inbox item, open related pages, and continue private conversations tied to your reviews.
          </p>
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-white/72">
            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5">
              {data.stats.unreadNotificationCount} unread
            </span>
            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5">
              {data.stats.notificationCount} total notifications
            </span>
            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5">
              {data.stats.directThreadCount} private thread{data.stats.directThreadCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Inbox messages</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
              Browse and read every notification
            </h2>
          </div>
          <Link
            className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--surface-dark)] transition hover:bg-white"
            href="/profile"
          >
            Back to profile
          </Link>
        </div>
        <div className="grid gap-4">
          {data.notifications.length > 0 ? (
            data.notifications.map((notification) => (
              <article key={notification.id} className="glass-panel rounded-[32px] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
                      {notification.kind.replaceAll("_", " ")} · {formatDate(notification.createdAt)}
                    </p>
                    <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[color:var(--surface-dark)]">
                      {notification.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{notification.body}</p>
                    {notification.sender ? (
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[color:var(--muted-strong)]">
                        From {notification.sender.displayName}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {notification.actionHref && notification.actionLabel ? (
                      <Link
                        className="rounded-full bg-[color:var(--surface-dark)] px-4 py-2 text-sm font-semibold text-white"
                        href={notification.actionHref}
                      >
                        {notification.actionLabel}
                      </Link>
                    ) : null}
                    <NotificationReadButton
                      initialStatus={notification.status}
                      notificationId={notification.id}
                    />
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
              No notifications yet.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="section-label">Private follow-up</p>
          <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
            Owner conversations tied to your reviews
          </h2>
        </div>
        <div className="grid gap-4">
          {data.directThreads.length > 0 ? (
            data.directThreads.map((thread) => (
              <article key={thread.id} className="glass-panel rounded-[32px] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
                      {thread.owner?.displayName ?? "Business owner"} · {thread.status}
                    </p>
                    <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[color:var(--surface-dark)]">
                      <Link href={thread.business ? `/business/${thread.business.slug}` : "/discover"}>
                        {thread.business?.name ?? "Unknown business"}
                      </Link>
                    </h3>
                  </div>
                  <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-strong)]">
                    {thread.messages.length} messages
                  </span>
                </div>
                <div className="mt-5">
                  <ReviewThreadCard
                    businessId={thread.businessId}
                    replyPlaceholder="Reply privately to the owner"
                    thread={thread}
                  />
                </div>
              </article>
            ))
          ) : (
            <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
              No private owner follow-up threads yet.
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
