import Link from "next/link";

import { SiteShell } from "@/components/layout/site-shell";
import { requireOwnerActor } from "@/lib/viewer";
import { readDatabase } from "@/server/database";

export default async function OwnerPage() {
  const actor = await requireOwnerActor("/owner");
  const database = await readDatabase();
  const ownedBusinesses =
    actor.role === "admin"
      ? database.businesses.filter((business) => business.ownerUserId)
      : database.businesses.filter((business) => business.ownerUserId === actor.userId);

  return (
    <SiteShell className="gap-8">
      <section className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-9 sm:py-9">
        <div className="grain-overlay" />
        <div className="relative space-y-4">
          <p className="section-label text-white/56">Owner dashboard</p>
          <h1 className="editorial-title max-w-3xl text-[clamp(2.7rem,5vw,4.7rem)] leading-[0.96] text-white">
            Read-only owner metrics for the businesses you now control.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
          Editing, replies, and richer owner workflows are intentionally deferred. This slice just proves the end-to-end handoff from claim approval to owner access.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {ownedBusinesses.map((business) => (
          <article key={business.id} className="glass-panel rounded-[34px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">Owned business</p>
                <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[color:var(--surface-dark)]">{business.name}</h2>
                <p className="mt-2 text-sm text-[color:var(--ink-soft)]">{business.address}</p>
              </div>
              <Link
                className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--surface-dark)] transition hover:bg-white"
                href={`/business/${business.slug}`}
              >
                View listing
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-black/8 bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Rating</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--surface-dark)]">{business.rating.toFixed(1)}</p>
              </div>
              <div className="rounded-[24px] border border-black/8 bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Reviews</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--surface-dark)]">{business.reviewCount}</p>
              </div>
              <div className="rounded-[24px] border border-black/8 bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Saves</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--surface-dark)]">{business.saveCount}</p>
              </div>
            </div>
            {business.claimedAt ? <p className="mt-4 text-sm text-black/55">Claim approved on {business.claimedAt.slice(0, 10)}</p> : null}
          </article>
        ))}
      </section>

      {ownedBusinesses.length === 0 ? (
        <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
          No owned businesses yet. Claim a business and have an admin approve it to unlock this dashboard.
        </div>
      ) : null}
    </SiteShell>
  );
}
