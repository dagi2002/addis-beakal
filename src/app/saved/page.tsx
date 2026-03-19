import Link from "next/link";

import { BusinessCard } from "@/components/business/business-card";
import { SiteShell } from "@/components/layout/site-shell";
import { getProfilePageData } from "@/features/profile/service";
import { requireSessionActor } from "@/lib/viewer";

export default async function SavedPage() {
  const actor = await requireSessionActor("/saved");
  const data = await getProfilePageData(actor.userId!);

  return (
    <SiteShell className="gap-8">
      <section className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-9 sm:py-9">
        <div className="grain-overlay" />
        <div className="relative space-y-4">
          <p className="section-label text-white/56">Saved places</p>
          <h1 className="editorial-title max-w-3xl text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.96] text-white">
            Your shortlist of Addis businesses worth coming back to.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
            Saves are tied to your signed-in account, so your shortlist stays consistent across discovery, listing
            pages, and future sessions.
          </p>
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Saved places</p>
              <p className="mt-2 text-3xl font-semibold text-white">{data.stats.savedCount}</p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Categories</p>
              <p className="mt-2 text-3xl font-semibold text-white">{data.stats.savedCategoryCount}</p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Areas</p>
              <p className="mt-2 text-3xl font-semibold text-white">{data.stats.savedNeighborhoodCount}</p>
            </div>
          </div>
        </div>
      </section>

      {data.savedBusinesses.length > 0 ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="glass-panel rounded-[34px] p-6">
              <p className="section-label">Collection pulse</p>
              <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
                Patterns in what you save
              </h2>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--surface-dark)]">Top categories</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.savedInsights.topCategories.map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-black/8 bg-white/72 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-strong)]"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--surface-dark)]">Top areas</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.savedInsights.topNeighborhoods.map((neighborhood) => (
                      <span
                        key={neighborhood}
                        className="rounded-full border border-black/8 bg-white/72 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-strong)]"
                      >
                        {neighborhood}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[34px] p-6">
              <p className="section-label">How saves work</p>
              <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
                Your shortlist stays yours
              </h2>
              <div className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                <p>Saves are attached to the account you are signed in with, not just the device you used.</p>
                <p>You can remove a place any time from here, discovery, or the business page and the state will stay in sync.</p>
                <p>Your saved places are private to your account.</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-semibold text-white"
                  href="/profile"
                >
                  Back to profile
                </Link>
                <Link
                  className="rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-semibold text-[color:var(--surface-dark)]"
                  href="/discover"
                >
                  Keep exploring
                </Link>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-label">Your collection</p>
                <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
                  Saved places across the city
                </h2>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {data.savedBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} variant="market" />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {data.savedBusinesses.length === 0 ? (
        <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
          <p>No saved businesses yet. Save a place from discovery or a business page to keep it here.</p>
          <div className="mt-6">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              href="/discover"
            >
              Explore businesses
            </Link>
          </div>
        </div>
      ) : null}
    </SiteShell>
  );
}
