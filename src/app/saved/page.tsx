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
          Saves are now tied to your account, so the state stays consistent across discovery, listing pages, and future signed-in sessions.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {data.savedBusinesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </section>

      {data.savedBusinesses.length === 0 ? (
        <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
          No saved businesses yet. Save a place from discovery or a business page to keep it here.
        </div>
      ) : null}
    </SiteShell>
  );
}
