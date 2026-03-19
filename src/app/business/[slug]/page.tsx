import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";

import { BusinessMap } from "@/components/business/business-map";
import { BusinessCard } from "@/components/business/business-card";
import { ReportForm } from "@/components/business/report-form";
import { ReviewForm } from "@/components/business/review-form";
import { SaveButton } from "@/components/business/save-button";
import { SiteShell } from "@/components/layout/site-shell";
import { Pill } from "@/components/shared/pill";
import { getBusinessPageData } from "@/features/businesses/service";
import { getViewerId } from "@/lib/viewer";
import { formatRating } from "@/lib/utils";

type BusinessDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  const { slug } = await params;
  const viewerId = await getViewerId();
  const data = await getBusinessPageData(slug, viewerId);

  return (
    <SiteShell className="pb-0 pt-4" compactMain showHeaderSearch>
      <section
        className="dark-panel grain-overlay overflow-hidden rounded-[40px]"
        style={{
          backgroundImage: `linear-gradient(135deg, ${data.business.coverFrom}, ${data.business.coverTo})`
        }}
      >
        <div className="grid gap-8 bg-[linear-gradient(180deg,rgba(31,22,14,0.1),rgba(18,13,9,0.68))] p-6 lg:grid-cols-[1.18fr_0.82fr] lg:p-8">
          <div className="space-y-6 text-white">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[rgba(255,248,239,0.88)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                {data.detail.category}
              </span>
              <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/84">
                {data.detail.neighborhood}
              </span>
              <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/84">
                {data.business.priceTier}
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="page-title max-w-4xl text-white">{data.business.name}</h1>
              <p className="max-w-2xl text-base leading-8 text-white/66">{data.business.shortDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-white/82">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5">
                <Star className="h-4 w-4 fill-[#f3bf74] text-[#f3bf74]" />
                {formatRating(data.business.rating)} from {data.business.reviewCount} public reviews
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5">
                <MapPin className="h-4 w-4" />
                {data.detail.address}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Rating", formatRating(data.business.rating)],
                ["Reviews", data.business.reviewCount.toString()],
                ["Saves", data.business.saveCount.toString()]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel space-y-5 rounded-[30px] p-5 sm:p-6">
            <SaveButton
              businessId={data.business.id}
              initialSaved={data.business.isSaved}
              initialSaveCount={data.business.saveCount}
            />
            <div className="space-y-3">
              <p className="section-label">About this listing</p>
              <h2 className="font-[var(--font-heading)] text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#23170f]">
                Built for people deciding where to go next, not just where to click.
              </h2>
              <p className="text-sm leading-7 text-[var(--muted)]">{data.detail.longDescription}</p>
            </div>
            {data.detail.ownerName ? (
              <p className="rounded-[22px] bg-[rgba(54,88,71,0.1)] px-4 py-3 text-sm text-[var(--moss)]">
                Claimed by {data.detail.ownerName}
              </p>
            ) : (
              <p className="rounded-[22px] bg-[rgba(197,91,45,0.08)] px-4 py-3 text-sm text-[var(--accent-strong)]">
                This listing is currently unclaimed.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {data.business.tags.map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
            <ReportForm businessId={data.business.id} label="Report this listing" />
            <ReviewForm
              businessId={data.business.id}
              hasReviewed={data.viewerState.hasReviewed}
              isAuthenticated={data.viewerState.isAuthenticated}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <p className="section-label">Public rating distribution</p>
          <h2 className="mt-4 font-[var(--font-heading)] text-[2rem] leading-[0.98] tracking-[-0.05em] text-[#23170f]">
            A quick read on how this place lands with people.
          </h2>
          <div className="mt-5 space-y-4">
            {data.reviewDistribution.map((entry) => (
              <div key={entry.rating} className="grid grid-cols-[48px_1fr_40px] items-center gap-3 text-sm">
                <span className="text-[var(--muted-strong)]">{entry.rating} star</span>
                <div className="h-2 rounded-full bg-[rgba(32,22,15,0.08)]">
                  <div
                    className="h-2 rounded-full bg-[var(--accent)]"
                    style={{
                      width: `${
                        data.business.reviewCount === 0
                          ? 0
                          : (entry.count / data.business.reviewCount) * 100
                      }%`
                    }}
                  />
                </div>
                <span className="text-right text-[var(--muted)]">{entry.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
            Only published reviews appear here. Pending, rejected, and removed reviews are excluded from both the list and the aggregate score.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Published reviews</p>
              <h2 className="editorial-title mt-3">What people are saying</h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]"
              href="/discover"
            >
              Back to discover
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4">
            {data.reviews.map((review) => (
              <article key={review.id} className="glass-panel rounded-[28px] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#23170f]">{review.authorName}</p>
                    <p className="text-sm text-[var(--muted)]">Visited {review.visitDate}</p>
                  </div>
                  <span className="rounded-full bg-[var(--surface-dark)] px-3 py-1 text-sm font-medium text-white">
                    {formatRating(review.rating)}
                  </span>
                </div>
                <h3 className="mt-4 font-[var(--font-heading)] text-[1.7rem] leading-[1.02] tracking-[-0.04em] text-[#23170f]">
                  {review.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{review.body}</p>
                {review.photoUrls.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {review.photoUrls.map((photoUrl) => (
                      <Image
                        key={photoUrl}
                        alt={`Review photo for ${data.business.name}`}
                        className="h-44 w-full rounded-[22px] object-cover"
                        height={320}
                        src={photoUrl}
                        unoptimized
                        width={480}
                      />
                    ))}
                  </div>
                ) : null}
                <div className="mt-4">
                  <ReportForm businessId={data.business.id} label="Report review" reviewId={review.id} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BusinessMap
        address={data.detail.address}
        businessName={data.business.name}
        neighborhood={data.detail.neighborhood}
      />

      {data.relatedBusinesses.length > 0 ? (
        <section className="space-y-5">
          <div>
            <p className="section-label">Related places</p>
            <h2 className="editorial-title mt-3">Similar category, same city energy.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {data.relatedBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
