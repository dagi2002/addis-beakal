import Link from "next/link";

import { ProfileForm } from "@/components/profile/profile-form";
import { SiteShell } from "@/components/layout/site-shell";
import { getProfilePageData } from "@/features/profile/service";
import { requireSessionActor } from "@/lib/viewer";

export default async function ProfilePage() {
  const actor = await requireSessionActor("/profile");
  const data = await getProfilePageData(actor.userId!);

  return (
    <SiteShell className="gap-10">
      <section className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <div className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-9 sm:py-9">
          <div className="grain-overlay" />
          <div className="relative space-y-8">
            <div className="space-y-4">
              <p className="section-label text-white/56">Your account</p>
              <h1 className="editorial-title max-w-2xl text-[clamp(2.8rem,6vw,4.7rem)] leading-[0.95] text-white">
                {data.user.displayName}
              </h1>
              <p className="text-sm text-white/62">{data.user.email}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Reviews</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.userReviews.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Saved</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.savedBusinesses.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Owned</p>
                <p className="mt-2 text-3xl font-semibold text-white">{data.ownedBusinesses.length}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(135deg,rgba(255,205,117,0.14),rgba(255,255,255,0.05))] p-5 text-sm leading-7 text-white/74">
              Your review snapshots stay historically accurate even when your display name changes, which keeps public
              trust and moderation records intact.
            </div>
          </div>
        </div>

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
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">{review.status}</p>
                  <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[color:var(--surface-dark)]">
                    <Link href={review.business ? `/business/${review.business.slug}` : "/discover"}>
                      {review.business?.name ?? "Unknown business"}
                    </Link>
                  </h3>
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
    </SiteShell>
  );
}
