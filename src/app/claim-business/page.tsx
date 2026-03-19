import { ClaimForm } from "@/components/claims/claim-form";
import { SiteShell } from "@/components/layout/site-shell";
import { getClaimPageData } from "@/features/claims/service";
import { requireSessionActor } from "@/lib/viewer";

export default async function ClaimBusinessPage() {
  const actor = await requireSessionActor("/claim-business");
  const data = await getClaimPageData(actor.userId!);

  return (
    <SiteShell className="gap-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-9 sm:py-9">
          <div className="grain-overlay" />
          <div className="relative space-y-7">
            <div className="space-y-4">
              <p className="section-label text-white/56">Ownership claims</p>
              <h1 className="editorial-title max-w-2xl text-[clamp(2.8rem,6vw,4.9rem)] leading-[0.95] text-white">
                Claim a listing and start the owner handoff.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                This slice includes submission, admin review, and the first owner-only dashboard after approval.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/12 bg-white/8 p-5 text-sm leading-7 text-white/72">
                Claims stay pending until an admin reviews them.
              </div>
              <div className="rounded-[26px] border border-white/12 bg-[linear-gradient(135deg,rgba(255,205,117,0.14),rgba(255,255,255,0.06))] p-5 text-sm leading-7 text-white/74">
                Approved claims immediately assign ownership and supersede competing pending requests.
              </div>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-[40px] p-6 sm:p-7">
          <ClaimForm
            businesses={data.businesses.map((business) => ({
              id: business.id,
              name: business.name,
              neighborhoodId: business.neighborhoodId
            }))}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="section-label">Your claim history</p>
          <h2 className="mt-3 font-[var(--font-heading)] text-4xl tracking-tight text-[color:var(--surface-dark)]">
            Submitted requests
          </h2>
        </div>
        <div className="grid gap-4">
          {data.existingClaims.map((claim) => (
            <article key={claim.id} className="glass-panel rounded-[32px] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">{claim.status}</p>
                  <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[color:var(--surface-dark)]">
                    {claim.business?.name ?? "Unknown business"}
                  </h3>
                </div>
                <span className="rounded-full border border-black/10 bg-black/5 px-3 py-2 text-sm text-[color:var(--ink-soft)]">
                  {claim.relationship}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{claim.proofText}</p>
              {claim.adminNote ? <p className="mt-3 text-sm text-black/55">Admin note: {claim.adminNote}</p> : null}
            </article>
          ))}
          {data.existingClaims.length === 0 ? (
            <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
              No claims submitted yet.
            </div>
          ) : null}
        </div>
      </section>
    </SiteShell>
  );
}
