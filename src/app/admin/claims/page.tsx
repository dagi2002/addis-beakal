import { ClaimReviewForm } from "@/components/admin/claim-review-form";
import { SiteShell } from "@/components/layout/site-shell";
import { getAdminClaimsPageData } from "@/features/claims/service";
import { requireAdminActor } from "@/lib/viewer";

export default async function AdminClaimsPage() {
  await requireAdminActor("/admin/claims");
  const claims = await getAdminClaimsPageData();

  return (
    <SiteShell className="gap-8">
      <section className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-9 sm:py-9">
        <div className="grain-overlay" />
        <div className="relative space-y-4">
          <p className="section-label text-white/56">Admin claims queue</p>
          <h1 className="editorial-title max-w-3xl text-[clamp(2.8rem,5.8vw,4.8rem)] leading-[0.96] text-white">
            Review and decide ownership requests.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
            Approving a claim assigns the business owner immediately and marks competing pending claims as superseded.
          </p>
        </div>
      </section>

      <section className="grid gap-5">
        {claims.map((claim) => (
          <article key={claim.id} className="glass-panel rounded-[34px] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">{claim.status}</p>
                <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[color:var(--surface-dark)]">
                  {claim.business?.name ?? "Unknown business"}
                </h2>
                <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
                  {claim.claimantName} · {claim.claimantEmail}
                </p>
              </div>
              <div className="rounded-[24px] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[color:var(--ink-soft)]">
                Relationship: {claim.relationship}
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{claim.proofText}</p>
            {claim.reviewedAt ? (
              <p className="mt-3 text-sm text-black/55">
                Reviewed by {claim.reviewer?.displayName ?? "Unknown"} on {claim.reviewedAt.slice(0, 10)}
              </p>
            ) : null}
            {claim.adminNote ? <p className="mt-2 text-sm text-black/55">Admin note: {claim.adminNote}</p> : null}
            <div className="mt-5">
              <ClaimReviewForm claimId={claim.id} disabled={claim.status !== "pending"} />
            </div>
          </article>
        ))}

        {claims.length === 0 ? (
          <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
            No claims in the queue yet.
          </div>
        ) : null}
      </section>
    </SiteShell>
  );
}
