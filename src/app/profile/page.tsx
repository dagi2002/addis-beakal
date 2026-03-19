import Link from "next/link";

import { ProfileForm } from "@/components/profile/profile-form";
import { SiteShell } from "@/components/layout/site-shell";
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

export default async function ProfilePage() {
  const actor = await requireSessionActor("/profile");
  const data = await getProfilePageData(actor.userId!);

  return (
    <SiteShell className="gap-10">
      <section className="grid gap-6 lg:grid-cols-[1.14fr_0.86fr]">
        <div className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-9 sm:py-9">
          <div className="grain-overlay" />
          <div className="relative space-y-8">
            <div className="space-y-4">
              <p className="section-label text-white/72">Your account</p>
              <h1 className="editorial-title max-w-2xl text-[clamp(2.8rem,6vw,4.7rem)] leading-[0.95] text-white">
                {data.user.displayName}
              </h1>
              <p className="text-sm text-white/92">{data.user.email}</p>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-white/68">
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5">{actor.role}</span>
                <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5">
                  Joined {formatDate(data.user.createdAt)}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Published</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.stats.publishedReviewCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Pending</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.stats.pendingReviewCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Saved</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.stats.savedCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Average</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {data.stats.publishedReviewCount > 0 ? data.stats.averageRatingGiven.toFixed(1) : "0.0"}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/14 bg-[linear-gradient(135deg,rgba(255,205,117,0.18),rgba(255,255,255,0.07))] p-5 text-sm leading-7 text-white/90">
              Your review snapshots stay historically accurate even when your display name changes, which keeps public
              trust and moderation records intact.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[40px] p-6 sm:p-7">
            <p className="section-label">Profile settings</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[color:var(--surface-dark)]">Display name</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
              Existing reviews keep their original snapshot name. New reviews use your current profile name.
            </p>
            <div className="mt-6">
              <ProfileForm initialDisplayName={data.user.displayName} />
            </div>
          </div>

          <div className="glass-panel rounded-[34px] p-6">
            <p className="section-label">Review identity</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-[2rem] leading-[1] text-[color:var(--surface-dark)]">
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

          <div className="glass-panel rounded-[34px] p-6">
            <p className="section-label">Quick access</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-semibold text-white"
                href="/saved"
              >
                Open saved places
              </Link>
              <Link
                className="rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-semibold text-[color:var(--surface-dark)]"
                href="/discover"
              >
                Explore more businesses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[36px] p-6 lg:p-8">
          <p className="section-label">Saved snapshot</p>
          <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
            The places you keep coming back to
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Saved places</p>
              <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">{data.stats.savedCount}</p>
            </div>
            <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Categories</p>
              <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                {data.stats.savedCategoryCount}
              </p>
            </div>
            <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Areas</p>
              <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                {data.stats.savedNeighborhoodCount}
              </p>
            </div>
          </div>
          {data.savedInsights.topCategories.length > 0 ? (
            <div className="mt-6">
              <p className="text-sm font-semibold text-[color:var(--surface-dark)]">Most saved categories</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.savedInsights.topCategories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-black/10 bg-white/72 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-strong)]"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-panel rounded-[36px] p-6 lg:p-8">
          <p className="section-label">Owned listings</p>
          <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
            Businesses attached to you
          </h2>
          <div className="mt-6 space-y-3">
            {data.ownedBusinesses.length > 0 ? (
              data.ownedBusinesses.map((business) => (
                <Link
                  key={business.id}
                  className="block rounded-[24px] border border-black/8 bg-white/72 p-4 transition hover:bg-white"
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
              <div className="rounded-[24px] border border-dashed border-black/10 bg-white/60 p-6 text-sm leading-7 text-[color:var(--ink-soft)]">
                You do not control a listing yet. Claim approval is what turns an account into an owner profile.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Your reviews</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
              Published and historical activity
            </h2>
          </div>
          <Link className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--surface-dark)] transition hover:bg-white" href="/saved">
            View saved places
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
              {review.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.tags.map((tag) => (
                    <span
                      key={`${review.id}-${tag}`}
                      className="rounded-full border border-black/8 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-strong)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
          {data.userReviews.length === 0 ? (
            <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
              You have not published a review yet.
            </div>
          ) : null}
        </div>
      </section>
    </SiteShell>
  );
}
