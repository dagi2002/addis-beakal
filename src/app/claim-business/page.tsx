import { ClaimForm } from "@/components/claims/claim-form";
import { SiteShell } from "@/components/layout/site-shell";
import { getClaimPageData } from "@/features/claims/service";
import { requireSessionActor } from "@/lib/viewer";

export default async function ClaimBusinessPage() {
  const actor = await requireSessionActor("/claim-business");
  const data = await getClaimPageData(actor.userId!);

  return (
    <SiteShell className="gap-10">
      <section className="mx-auto w-full max-w-[880px]">
        <ClaimForm
          businesses={data.businesses.map((business) => ({
            id: business.id,
            name: business.name,
            neighborhood: business.neighborhood,
            category: business.category
          }))}
        />
      </section>

      <section className="scroll-mt-28 space-y-4" id="claim-history">
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
                  {claim.business ? (
                    <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
                      {claim.business.neighborhood} · {claim.business.category}
                    </p>
                  ) : null}
                </div>
                {claim.claimantPhone ? (
                  <span className="rounded-full border border-black/10 bg-black/5 px-3 py-2 text-sm text-[color:var(--ink-soft)]">
                    {claim.claimantPhone}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{claim.proofText}</p>
              {claim.proofFileUrls.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {claim.proofFileUrls.map((fileUrl, index) => (
                    <a
                      key={fileUrl}
                      className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--surface-dark)]"
                      href={fileUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View proof file {index + 1}
                    </a>
                  ))}
                </div>
              ) : null}
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
