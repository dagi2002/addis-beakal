import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { NotificationReadButton } from "@/components/profile/notification-read-button";
import { ProfileForm } from "@/components/profile/profile-form";
import { getProfilePageData } from "@/features/profile/service";
import { requireSessionActor } from "@/lib/viewer";

type ProfilePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sectionOptions = ["overview", "reviews", "saved", "ownership", "settings"] as const;
type ProfileSection = (typeof sectionOptions)[number];

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

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSection(value: string | undefined): ProfileSection {
  return sectionOptions.includes(value as ProfileSection) ? (value as ProfileSection) : "overview";
}

function buildProfileHref(section: ProfileSection) {
  return section === "overview" ? "/profile" : `/profile?section=${section}`;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const actor = await requireSessionActor("/profile");
  const params = (await searchParams) ?? {};
  const rawSection = getSearchParam(params.section);
  if (rawSection === "inbox") {
    redirect("/notifications");
  }
  const section = getSection(rawSection);
  const data = await getProfilePageData(actor.userId!);

  return (
    <SiteShell className="gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-9 sm:py-9">
          <div className="grain-overlay" />
          <div className="relative space-y-7 text-white">
            <div className="space-y-4">
              <p className="section-label text-white/72">Your account</p>
              <h1 className="editorial-title max-w-2xl text-[clamp(2.8rem,6vw,4.7rem)] leading-[0.95] text-white">
                {data.user.displayName}
              </h1>
              <p className="text-sm text-white/92">{data.user.email}</p>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em]">
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-white/78">
                  {actor.role}
                </span>
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-white/78">
                  Joined {formatDate(data.user.createdAt)}
                </span>
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-white/78">
                  {data.stats.unreadNotificationCount} unread inbox item
                  {data.stats.unreadNotificationCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Published</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.stats.publishedReviewCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Saved</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.stats.savedCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Inbox</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.stats.notificationCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Owned</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.stats.ownedCount}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/14 bg-[linear-gradient(135deg,rgba(255,205,117,0.18),rgba(255,255,255,0.07))] p-5 text-sm leading-7 text-white/90">
              Your inbox now holds admin announcements, claim updates, and private owner follow-up tied to your reviews.
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[40px] p-6 sm:p-7">
          <p className="section-label">Account center</p>
          <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[color:var(--surface-dark)]">
            Manage your account
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--ink-soft)]">
            Reviews, inbox activity, saved places, ownership, and account settings all stay grouped here.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {sectionOptions.map((option) => (
              <Link
                key={option}
                className={
                  option === section
                    ? "rounded-full bg-[color:var(--surface-dark)] px-4 py-2.5 text-sm font-semibold capitalize text-white"
                    : "rounded-full border border-black/10 bg-white/75 px-4 py-2.5 text-sm font-semibold capitalize text-[color:var(--surface-dark)] transition hover:bg-white"
                }
                href={buildProfileHref(option)}
              >
                {option}
              </Link>
            ))}
            <Link
              className="rounded-full border border-black/10 bg-white/75 px-4 py-2.5 text-sm font-semibold text-[color:var(--surface-dark)] transition hover:bg-white"
              href="/notifications"
            >
              Inbox
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              className="rounded-[24px] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[color:var(--surface-dark)] transition hover:bg-white"
              href="/discover"
            >
              Explore more businesses
            </Link>
            <Link
              className="rounded-[24px] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[color:var(--surface-dark)] transition hover:bg-white"
              href="/saved"
            >
              Open saved places
            </Link>
            <Link
              className="rounded-[24px] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[color:var(--surface-dark)] transition hover:bg-white"
              href="/claim-business"
            >
              Track business claims
            </Link>
            <Link
              className="rounded-[24px] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[color:var(--surface-dark)] transition hover:bg-white"
              href="/notifications"
            >
              Open inbox
            </Link>
            {data.ownedBusinesses.length > 0 ? (
              <Link
                className="rounded-[24px] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[color:var(--surface-dark)] transition hover:bg-white"
                href="/owner"
              >
                Open owner dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {section === "overview" ? (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-[36px] p-6 lg:p-8">
            <p className="section-label">Snapshot</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
              What is happening on your account
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Unread inbox</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                  {data.stats.unreadNotificationCount}
                </p>
              </div>
              <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Private follow-up</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                  {data.stats.directThreadCount}
                </p>
              </div>
              <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Saved categories</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                  {data.stats.savedCategoryCount}
                </p>
              </div>
              <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Average rating given</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                  {data.stats.publishedReviewCount > 0 ? data.stats.averageRatingGiven.toFixed(1) : "0.0"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[36px] p-6 lg:p-8">
            <p className="section-label">Latest inbox items</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
              Messages that need you
            </h2>
            <div className="mt-4">
              <Link
                className="inline-flex rounded-full border border-black/10 bg-white/75 px-4 py-2 text-sm font-semibold text-[color:var(--surface-dark)] transition hover:bg-white"
                href="/notifications"
              >
                Open full inbox
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {data.notifications.slice(0, 4).map((notification) => (
                <article key={notification.id} className="rounded-[24px] border border-black/8 bg-white/72 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[color:var(--surface-dark)]">{notification.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">{notification.body}</p>
                    </div>
                    <NotificationReadButton
                      initialStatus={notification.status}
                      notificationId={notification.id}
                    />
                  </div>
                </article>
              ))}
              {data.notifications.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-black/10 bg-white/60 p-6 text-sm leading-7 text-[color:var(--ink-soft)]">
                  Your inbox is clear right now.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {section === "reviews" ? (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Your reviews</p>
              <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
                Published and historical activity
              </h2>
            </div>
            <Link
              className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--surface-dark)] transition hover:bg-white"
              href="/discover"
            >
              Write another review
            </Link>
          </div>
          <div className="grid gap-4">
            {data.userReviews.map((review) => (
              <article key={review.id} className="glass-panel rounded-[32px] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
                      {review.status} · {formatDate(review.createdAt)}
                    </p>
                    <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[color:var(--surface-dark)]">
                      <Link href={review.business ? `/business/${review.business.slug}` : "/discover"}>
                        {review.business?.name ?? "Unknown business"}
                      </Link>
                    </h3>
                    {review.business ? (
                      <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
                        {review.business.neighborhood} · {review.business.category}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-[color:var(--surface-dark)] px-3 py-1.5 text-sm font-medium text-white">
                    {review.rating}.0
                  </span>
                </div>
                <p className="mt-5 text-base font-semibold text-[color:var(--surface-dark)]">{review.title}</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{review.body}</p>
              </article>
            ))}
            {data.userReviews.length === 0 ? (
              <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
                You have not published a review yet.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {section === "saved" ? (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Saved places</p>
              <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
                The businesses you want to come back to
              </h2>
            </div>
            <Link
              className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--surface-dark)] transition hover:bg-white"
              href="/saved"
            >
              Open full saved page
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Saved places</p>
              <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">{data.stats.savedCount}</p>
            </div>
            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Categories</p>
              <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                {data.stats.savedCategoryCount}
              </p>
            </div>
            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Areas</p>
              <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                {data.stats.savedNeighborhoodCount}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.savedBusinesses.map((business) => (
              <Link
                key={business.id}
                className="glass-panel rounded-[28px] p-5 transition hover:bg-white/95"
                href={`/business/${business.slug}`}
              >
                <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--muted-strong)]">
                  {business.category}
                </p>
                <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[color:var(--surface-dark)]">
                  {business.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{business.shortDescription}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[color:var(--muted-strong)]">
                  {business.neighborhood} · {business.reviewCount} reviews · {business.saveCount} saves
                </p>
              </Link>
            ))}
            {data.savedBusinesses.length === 0 ? (
              <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
                You have not saved a place yet.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {section === "ownership" ? (
        <section className="space-y-5">
          <div>
            <p className="section-label">Owned listings</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
              Businesses attached to you
            </h2>
          </div>
          <div className="grid gap-4">
            {data.ownedBusinesses.length > 0 ? (
              data.ownedBusinesses.map((business) => (
                <Link
                  key={business.id}
                  className="glass-panel block rounded-[32px] p-6 transition hover:bg-white/95"
                  href={`/business/${business.slug}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[color:var(--surface-dark)]">{business.name}</p>
                      <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                        {business.neighborhood} · {business.category}
                      </p>
                    </div>
                    <span className="rounded-full bg-[rgba(54,88,71,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--moss)]">
                      Owned
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
                You do not control a listing yet. Claim approval or admin assignment is what turns an account into an owner profile.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {section === "settings" ? (
        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="glass-panel rounded-[40px] p-6 sm:p-7">
            <p className="section-label">Profile settings</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[color:var(--surface-dark)]">
              Display name
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
              Existing reviews keep their original snapshot name. New reviews use your current profile name.
            </p>
            <div className="mt-6">
              <ProfileForm initialDisplayName={data.user.displayName} />
            </div>
          </div>

          <div className="glass-panel rounded-[40px] p-6 sm:p-7">
            <p className="section-label">Review identity</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[color:var(--surface-dark)]">
              What people actually see
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--ink-soft)]">
              <p>Reviews are created from the account you are currently signed in with.</p>
              <p>Publicly, readers see your display name snapshot, not your email and not a hidden username.</p>
              <p>
                Display name is enough for the public side. The signed-in account still owns the review behind the
                scenes for moderation and account history.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
