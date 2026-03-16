import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import { BusinessCard } from "@/components/business/business-card";
import { ReportForm } from "@/components/business/report-form";
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
    <SiteShell className="gap-10">
      <section
        className="overflow-hidden rounded-[36px] border border-black/8 bg-white/80 shadow-soft"
        style={{
          backgroundImage: `linear-gradient(135deg, ${data.business.coverFrom}, ${data.business.coverTo})`
        }}
      >
        <div className="grid gap-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.82))] p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Pill>{data.detail.category}</Pill>
              <Pill>{data.detail.neighborhood}</Pill>
              <Pill>{data.business.priceTier}</Pill>
            </div>
            <div className="space-y-3">
              <h1 className="font-[var(--font-heading)] text-4xl tracking-tight sm:text-5xl">{data.business.name}</h1>
              <p className="max-w-2xl text-base leading-7 text-black/70">{data.business.shortDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-black/70">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {formatRating(data.business.rating)} from {data.business.reviewCount} public reviews
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2">
                <MapPin className="h-4 w-4" />
                {data.detail.address}
              </span>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] bg-white/72 p-5 backdrop-blur">
            <SaveButton
              businessId={data.business.id}
              initialSaved={data.business.isSaved}
              initialSaveCount={data.business.saveCount}
            />
            <div className="space-y-3">
              <h2 className="font-semibold">About this listing</h2>
              <p className="text-sm leading-7 text-black/65">{data.detail.longDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.business.tags.map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
            <ReportForm businessId={data.business.id} label="Report this listing" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[32px] border border-black/8 bg-white/80 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Public rating distribution</p>
          <div className="mt-5 space-y-4">
            {data.reviewDistribution.map((entry) => (
              <div key={entry.rating} className="grid grid-cols-[48px_1fr_40px] items-center gap-3 text-sm">
                <span>{entry.rating} star</span>
                <div className="h-2 rounded-full bg-black/7">
                  <div
                    className="h-2 rounded-full bg-black"
                    style={{
                      width: `${
                        data.business.reviewCount === 0
                          ? 0
                          : (entry.count / data.business.reviewCount) * 100
                      }%`
                    }}
                  />
                </div>
                <span className="text-right text-black/55">{entry.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-black/60">
            Only published reviews appear here. Pending, rejected, and removed reviews are excluded from both the list and the aggregate score.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-black/45">Published reviews</p>
              <h2 className="mt-2 font-[var(--font-heading)] text-3xl tracking-tight">Moderation-aware social proof</h2>
            </div>
            <Link className="text-sm font-medium text-black/60" href="/discover">
              Back to discover
            </Link>
          </div>
          <div className="grid gap-4">
            {data.reviews.map((review) => (
              <article key={review.id} className="rounded-[28px] border border-black/8 bg-white/80 p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{review.authorName}</p>
                    <p className="text-sm text-black/50">Visited {review.visitDate}</p>
                  </div>
                  <span className="rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
                    {formatRating(review.rating)}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{review.title}</h3>
                <p className="mt-2 text-sm leading-7 text-black/65">{review.body}</p>
                <div className="mt-4">
                  <ReportForm businessId={data.business.id} label="Report review" reviewId={review.id} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {data.relatedBusinesses.length > 0 ? (
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Related places</p>
            <h2 className="mt-2 font-[var(--font-heading)] text-3xl tracking-tight">Similar category, same public model</h2>
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
