import Link from "next/link";

import { ClaimReviewForm } from "@/components/admin/claim-review-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminClaimDetailData } from "@/features/admin/service";

type ClaimDetailPageProps = {
  params: Promise<{ claimId: string }>;
};

export default async function AdminClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { claimId } = await params;
  const data = await getAdminClaimDetailData(claimId);
  const claim = data.claim;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Claims", href: "/admin/claims/pending" },
          { label: claim.business?.name ?? "Claim Detail" }
        ]}
        description="Review the claimant, ownership proof, and any competing requests before you act."
        title={claim.business?.name ?? "Claim Detail"}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
        <section className="space-y-6 rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <AdminStatusBadge label={claim.statusLabel} status={claim.statusView} />
              <h2 className="mt-4 font-[var(--font-heading)] text-3xl tracking-[-0.05em] text-[#111b2d]">
                {claim.business?.name ?? "Unknown business"}
              </h2>
              <p className="mt-2 text-sm text-[#66768c]">
                {claim.neighborhood} · {claim.category}
              </p>
            </div>
            <div className="rounded-[24px] border border-[#e6ebf2] bg-[#fbfcfe] px-4 py-3 text-sm text-[#66768c]">
              Submitted {claim.createdAt.slice(0, 10)}
            </div>
          </div>

          <div className="grid gap-4 rounded-[26px] border border-[#eef2f7] bg-[#fbfcfe] p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8ca1]">Claimant</p>
              <p className="mt-2 text-base font-semibold text-[#111b2d]">{claim.claimantName}</p>
              <p className="mt-1 text-sm text-[#66768c]">{claim.claimantEmail}</p>
              {claim.claimantPhone ? <p className="mt-1 text-sm text-[#66768c]">{claim.claimantPhone}</p> : null}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8ca1]">Reviewer</p>
              <p className="mt-2 text-base font-semibold text-[#111b2d]">{claim.reviewer?.displayName ?? "Not reviewed yet"}</p>
              {claim.reviewedAt ? <p className="mt-1 text-sm text-[#66768c]">{claim.reviewedAt.slice(0, 10)}</p> : null}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8ca1]">Proof of ownership</p>
            <p className="mt-3 text-sm leading-7 text-[#66768c]">{claim.proofText}</p>
            {claim.proofFileUrls.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {claim.proofFileUrls.map((fileUrl, index) => (
                  <a
                    key={fileUrl}
                    className="rounded-full border border-[#d8e2ee] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#54667c]"
                    href={fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Proof file {index + 1}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {claim.adminNote ? (
            <div className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcfe] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8ca1]">Existing admin note</p>
              <p className="mt-3 text-sm leading-7 text-[#66768c]">{claim.adminNote}</p>
            </div>
          ) : null}

          <ClaimReviewForm claimId={claim.id} disabled={claim.status !== "pending"} />
        </section>

        <aside className="space-y-6">
          <section className="rounded-[30px] border border-[#e6ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-[var(--font-heading)] text-2xl tracking-[-0.05em] text-[#111b2d]">Competing claims</h3>
              <Link className="text-sm font-semibold text-[var(--accent)]" href="/admin/claims">
                All claims
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {data.competingClaims.length > 0 ? (
                data.competingClaims.map((competingClaim) => (
                  <Link
                    key={competingClaim.id}
                    className="block rounded-[22px] border border-[#eef2f7] bg-[#fbfcfe] p-4 transition hover:border-[#dfe6f0]"
                    href={`/admin/claims/${competingClaim.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#111b2d]">{competingClaim.claimantName}</p>
                        <p className="mt-1 text-sm text-[#66768c]">{competingClaim.claimantEmail}</p>
                      </div>
                      <AdminStatusBadge label={competingClaim.statusLabel} status={competingClaim.statusView} />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[#66768c]">No competing claims for this business.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
