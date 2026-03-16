import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, TrendingUp } from "lucide-react";

import { BusinessCard } from "@/components/business/business-card";
import { ReportForm } from "@/components/business/report-form";
import { SiteShell } from "@/components/layout/site-shell";
import { Pill } from "@/components/shared/pill";
import { getHomePageData } from "@/features/businesses/service";
import { getViewerId } from "@/lib/viewer";
import { formatCompactNumber, formatRating } from "@/lib/utils";

export default async function HomePage() {
  const viewerId = await getViewerId();
  const data = await getHomePageData(viewerId);

  return (
    <SiteShell className="gap-14">
      <section className="grid gap-8 rounded-[36px] border border-black/8 bg-white/70 p-6 shadow-soft backdrop-blur lg:grid-cols-[1.35fr_0.9fr] lg:p-8">
        <div className="space-y-6">
          <Pill className="bg-clay/10 text-clay">Addis discovery, rebuilt for production</Pill>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-[var(--font-heading)] text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find the local spots Addis people actually save, review, and report with confidence.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-black/65 sm:text-lg">
              Phase 1 focuses on the public browsing experience, real derived stats, moderation-aware
              review scoring, and cleaner shared logic than the original Base44 build.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
              href="/discover"
            >
              Explore businesses
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-medium"
              href="#reporting-and-moderation"
            >
              Review trust & safety
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Businesses", formatCompactNumber(data.stats.businessCount)],
            ["Published reviews", formatCompactNumber(data.stats.reviewCount)],
            ["Neighborhoods", formatCompactNumber(data.stats.neighborhoodCount)],
            ["Saves", formatCompactNumber(data.stats.saveCount)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-[28px] border border-black/8 bg-sand p-5">
              <p className="text-sm text-black/55">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Featured now</p>
            <h2 className="mt-2 font-[var(--font-heading)] text-3xl tracking-tight">Core public experience</h2>
          </div>
          <Link className="text-sm font-medium text-black/60" href="/discover">
            Browse all
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {data.featuredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[32px] border border-black/8 bg-white/80 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Why this phase first</p>
          <div className="mt-5 space-y-4">
            <div className="flex gap-4">
              <ShieldCheck className="mt-1 h-5 w-5 text-moss" />
              <div>
                <h3 className="font-semibold">Moderation-aware ratings</h3>
                <p className="text-sm leading-6 text-black/60">
                  Only published reviews contribute to public scores. Pending and removed content is excluded from the aggregate.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <TrendingUp className="mt-1 h-5 w-5 text-clay" />
              <div>
                <h3 className="font-semibold">Real home metrics</h3>
                <p className="text-sm leading-6 text-black/60">
                  Stats are derived from the underlying business, review, neighborhood, and save records instead of hard-coded placeholders.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Star className="mt-1 h-5 w-5 text-gold" />
              <div>
                <h3 className="font-semibold">Shared logic for saves and discovery</h3>
                <p className="text-sm leading-6 text-black/60">
                  The discovery, save, and aggregation flows now live behind reusable services instead of being duplicated in page code.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-black/8 bg-white/80 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Recent published reviews</p>
          <div className="mt-5 grid gap-4">
            {data.recentReviews.map((review) => (
              <article key={review.id} className="rounded-[24px] border border-black/8 bg-black/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{review.businessName}</h3>
                    <p className="text-sm text-black/55">{review.authorName}</p>
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium">
                    {formatRating(review.rating)}
                  </span>
                </div>
                <p className="mt-3 font-medium">{review.title}</p>
                <p className="mt-2 text-sm leading-6 text-black/60">{review.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="grid gap-6 rounded-[32px] border border-black/8 bg-white/80 p-6 shadow-soft lg:grid-cols-[1fr_0.9fr]"
        id="reporting-and-moderation"
      >
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Reporting and moderation</p>
          <h2 className="font-[var(--font-heading)] text-3xl tracking-tight">
            Trust and safety starts in the data model, not as a later patch.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-black/65">
            This rebuild starts with explicit review states, real report records, and derived rating rules that
            immediately exclude anything that is no longer public.
          </p>
        </div>
        <ReportForm businessId={data.featuredBusinesses[0]?.id ?? ""} label="Submit a demo business report" />
      </section>
    </SiteShell>
  );
}
