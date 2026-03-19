"use client";

import Image from "next/image";
import { Clock3, ExternalLink, MapPin, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { ReportForm } from "@/components/business/report-form";
import { ReviewForm } from "@/components/business/review-form";
import { SaveButton } from "@/components/business/save-button";
import { Pill } from "@/components/shared/pill";
import { formatRating } from "@/lib/utils";

type BusinessDetailTabsProps = {
  business: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    saveCount: number;
    tags: string[];
    priceTier: string;
    isSaved: boolean;
    category: string;
    neighborhood: string;
    address: string;
    coverFrom: string;
    coverTo: string;
  };
  detail: {
    longDescription: string;
    contactAddress: string;
    googleMapsUrl?: string;
    openToday: string;
    openingHours: [string, string][];
    services: Array<{ name: string; priceEtb: number; description: string }>;
    photos: Array<{ title: string; url?: string; from?: string; to?: string }>;
    heroImageUrl: string;
    features: string[];
    isVerified: boolean;
    isFeatured: boolean;
    viewCount: number;
  };
  reviews: Array<{
    id: string;
    authorName: string;
    title: string;
    body: string;
    tags: string[];
    rating: number;
    visitDate: string;
    photoUrls: string[];
  }>;
  reviewDistribution: Array<{
    rating: number;
    count: number;
  }>;
  viewerState: {
    isAuthenticated: boolean;
    hasReviewed: boolean;
  };
};

const tabOptions = ["overview", "reviews", "photos", "hours"] as const;
type ActiveTab = (typeof tabOptions)[number];

function formatVisitDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatPriceTier(priceTier: string) {
  if (priceTier === "$") return "Budget · under 300 ETB";
  if (priceTier === "$$") return "Mid-range · 300-800 ETB";
  if (priceTier === "$$$") return "Premium · 800-1,800 ETB";
  return "Luxury · 1,800+ ETB";
}

export function BusinessDetailTabs({
  business,
  detail,
  reviews,
  reviewDistribution,
  viewerState
}: BusinessDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const mapQuery = encodeURIComponent(`${business.name}, ${detail.contactAddress}, Addis Ababa, Ethiopia`);
  const mapUrl = detail.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const recentReviews = reviews.slice(0, 3);
  const highestDistributionCount = Math.max(...reviewDistribution.map((item) => item.count), 1);
  const photoGallery = useMemo(
    () => [
      ...detail.photos.map((photo) =>
        photo.url
          ? { kind: "image" as const, title: photo.title, url: photo.url }
          : { kind: "gradient" as const, title: photo.title, from: photo.from ?? "#d0d9e6", to: photo.to ?? "#f5f7fb" }
      ),
      ...reviews.flatMap((review) =>
        review.photoUrls.map((url) => ({
          kind: "image" as const,
          title: review.title || `${review.authorName}'s review`,
          url
        }))
      )
    ],
    [detail.photos, reviews]
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-[#e7edf5] bg-white shadow-[0_18px_44px_rgba(34,51,84,0.08)]">
        <div className="relative h-[260px] sm:h-[340px] lg:h-[420px]">
          <Image
            alt={`${business.name} hero`}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={detail.heroImageUrl}
            unoptimized
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,17,28,0.08),rgba(12,17,28,0.34))]" />
        </div>
        <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-12 rounded-[32px] bg-white p-6 shadow-[0_24px_60px_rgba(34,51,84,0.12)] sm:-mt-16 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#f7ce7a] bg-[#fff8e8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a56a10]">
                    {business.category}
                  </span>
                  {detail.isVerified ? (
                    <span className="rounded-full bg-[#dff7e8] px-4 py-2 text-xs font-semibold text-[#1c8d5d]">
                      Verified
                    </span>
                  ) : null}
                  {detail.isFeatured ? (
                    <span className="rounded-full bg-[#ff961f] px-4 py-2 text-xs font-semibold text-white">
                      Featured
                    </span>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <h1 className="text-[2.7rem] font-semibold leading-[0.92] tracking-[-0.06em] text-[#111b2d] sm:text-[3.6rem]">
                    {business.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-[1.05rem] text-[#5d6f86]">
                    <span className="flex items-center gap-1.5 text-[#f2b31a]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={`${business.id}-star-${index}`}
                          className={index < Math.round(business.rating) ? "h-5 w-5 fill-current" : "h-5 w-5 text-[#d9e2ef]"}
                        />
                      ))}
                    </span>
                    <span className="font-semibold text-[#162033]">{formatRating(business.rating)}</span>
                    <span>({business.reviewCount} reviews)</span>
                    <span>{formatPriceTier(business.priceTier)}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {business.neighborhood}, Addis Ababa
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {business.tags.map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <SaveButton
                  businessId={business.id}
                  initialSaved={business.isSaved}
                  initialSaveCount={business.saveCount}
                  className="border-[#f4c96f] bg-[#fffaf0] text-[#9b5e06]"
                />
                <ReviewForm
                  businessId={business.id}
                  businessName={business.name}
                  className="bg-[#f59e19] text-white hover:bg-[#e58a08]"
                  hasReviewed={viewerState.hasReviewed}
                  isAuthenticated={viewerState.isAuthenticated}
                  label="Write Review"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-[#e7edf5] bg-white p-1.5 shadow-[0_14px_34px_rgba(34,51,84,0.06)]">
        <div className="flex flex-wrap gap-2">
          {tabOptions.map((tab) => (
            <button
              key={tab}
              className={
                activeTab === tab
                  ? "rounded-[22px] bg-[#151f33] px-8 py-4 text-lg font-semibold capitalize text-white"
                  : "rounded-[22px] px-8 py-4 text-lg font-semibold capitalize text-[#677a92] transition hover:bg-[#f6f8fb]"
              }
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "overview" ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_430px]">
          <div className="space-y-6">
            <article className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
              <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">About</h2>
              <p className="mt-5 text-[1.12rem] leading-10 text-[#4f6179]">{detail.longDescription}</p>
            </article>

            <article className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
              <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">Services & Menu</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {detail.services.map((service) => (
                  <div key={service.name} className="rounded-[24px] bg-[#f7f9fc] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[1.1rem] font-semibold text-[#152033]">{service.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#66768c]">{service.description}</p>
                      </div>
                      <span className="whitespace-nowrap text-[1.05rem] font-bold text-[#ef8613]">
                        {service.priceEtb} ETB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">Recent Reviews</h2>
                {reviews.length > 3 ? (
                  <button
                    className="text-lg font-semibold text-[#ef8613]"
                    onClick={() => setActiveTab("reviews")}
                    type="button"
                  >
                    See all ({reviews.length})
                  </button>
                ) : null}
              </div>
              <div className="mt-6 space-y-4">
                {recentReviews.map((review) => (
                  <article key={review.id} className="rounded-[24px] border border-[#edf2f8] bg-[#fbfcfe] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-[#162033]">{review.authorName}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[#66768c]">
                          <span className="flex items-center gap-1 text-[#f2b31a]">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={`${review.id}-overview-${index}`}
                                className={index < Math.round(review.rating) ? "h-4 w-4 fill-current" : "h-4 w-4 text-[#d9e2ef]"}
                              />
                            ))}
                          </span>
                          <span>{formatVisitDate(review.visitDate)}</span>
                        </div>
                      </div>
                    </div>
                    {review.title ? (
                      <h3 className="mt-4 text-[1.1rem] font-semibold text-[#162033]">{review.title}</h3>
                    ) : null}
                    <p className="mt-2 text-sm leading-7 text-[#66768c]">{review.body}</p>
                    {review.tags.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {review.tags.map((tag) => (
                          <span
                            key={`${review.id}-overview-${tag}`}
                            className="rounded-full border border-[#e4ebf4] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f7f94]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d8ca1]">Review snapshot</p>
                  <div className="mt-3 flex items-end gap-3">
                    <p className="text-[3.3rem] font-semibold leading-none tracking-[-0.07em] text-[#111b2d]">
                      {formatRating(business.rating)}
                    </p>
                    <div className="pb-2">
                      <div className="flex items-center gap-1 text-[#f2b31a]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={`${business.id}-summary-${index}`}
                            className={index < Math.round(business.rating) ? "h-4 w-4 fill-current" : "h-4 w-4 text-[#d9e2ef]"}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-[#66768c]">{business.reviewCount} public reviews</p>
                    </div>
                  </div>
                </div>
                <ReviewForm
                  businessId={business.id}
                  businessName={business.name}
                  className="bg-[#151f33] text-white hover:bg-[#0f1726]"
                  hasReviewed={viewerState.hasReviewed}
                  isAuthenticated={viewerState.isAuthenticated}
                  label="Write review"
                />
              </div>
              <div className="mt-6 space-y-3">
                {reviewDistribution.map((entry) => (
                  <div key={entry.rating} className="grid grid-cols-[60px_minmax(0,1fr)_30px] items-center gap-3">
                    <p className="text-sm font-medium text-[#55657b]">{entry.rating} star</p>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2f8]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#f5bb43,#ef8613)]"
                        style={{ width: `${(entry.count / highestDistributionCount) * 100}%` }}
                      />
                    </div>
                    <p className="text-right text-sm font-semibold text-[#111b2d]">{entry.count}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
              <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">Contact & Info</h2>
              <div className="mt-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-[18px] bg-[#fff4d6] p-4 text-[#dd8b09]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="pt-1">
                    <p className="text-[1.1rem] font-semibold text-[#111b2d]">Location</p>
                    <p className="mt-1 text-[1.05rem] text-[#42536a]">{detail.contactAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-[18px] bg-[#fff4d6] p-4 text-[#dd8b09]">
                    <Clock3 className="h-6 w-6" />
                  </div>
                  <div className="pt-1">
                    <p className="text-[1.1rem] font-semibold text-[#1d9b45]">Open Today</p>
                    <p className="mt-1 text-[1.05rem] text-[#42536a]">{detail.openToday}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-[18px] bg-[#fff4d6] p-4 text-[#dd8b09]">
                    <Star className="h-6 w-6" />
                  </div>
                  <div className="pt-1">
                    <p className="text-[1.1rem] font-semibold text-[#111b2d]">Price range</p>
                    <p className="mt-1 text-[1.05rem] text-[#42536a]">{formatPriceTier(business.priceTier)}</p>
                  </div>
                </div>
                {detail.features.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d8ca1]">Features</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {detail.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full border border-[#e4ebf4] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f7f94]"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </article>

            <article className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">Location</h2>
                <a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#ef8613]"
                  href={mapUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in Maps
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-6 flex min-h-[260px] flex-col items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,#edf3fb,#dfe8f4)] text-center">
                <MapPin className="h-10 w-10 text-[#f3b120]" />
                <p className="mt-4 text-[1.35rem] font-semibold text-[#6b7c92]">{business.neighborhood}</p>
                <p className="mt-1 max-w-[240px] text-lg text-[#8593a5]">Addis Ababa</p>
              </div>
            </article>

            <article className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
              <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">Stats</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  ["Reviews", business.reviewCount.toLocaleString()],
                  ["Saves", business.saveCount.toLocaleString()],
                  ["Views", detail.viewCount.toLocaleString()]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[24px] bg-[#f7f9fc] px-5 py-6 text-center xl:text-left">
                    <p className="text-4xl font-semibold tracking-[-0.05em] text-[#111b2d]">{value}</p>
                    <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-[#7988a0]">{label}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>
      ) : null}

      {activeTab === "reviews" ? (
        <section className="space-y-4">
          <article className="rounded-[30px] border border-[#e7edf5] bg-[linear-gradient(135deg,#fff9ef,#ffffff)] p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d8ca1]">Write a review</p>
                <h2 className="mt-3 text-[2.1rem] font-semibold tracking-[-0.05em] text-[#121c30]">
                  Help the next person decide faster.
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-8 text-[#5c6f87]">
                  Share what stood out, add a few tags, and give people the local context they
                  actually use when choosing where to go.
                </p>
              </div>
              <ReviewForm
                businessId={business.id}
                businessName={business.name}
                className="bg-[#f59e19] text-white hover:bg-[#e58a08]"
                hasReviewed={viewerState.hasReviewed}
                isAuthenticated={viewerState.isAuthenticated}
                label="Write review"
              />
            </div>
          </article>

          {reviews.map((review) => (
            <article key={review.id} className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[1.15rem] font-semibold text-[#162033]">{review.authorName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#66768c]">
                    <span className="flex items-center gap-1 text-[#f2b31a]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={`${review.id}-review-${index}`}
                          className={index < Math.round(review.rating) ? "h-4 w-4 fill-current" : "h-4 w-4 text-[#d9e2ef]"}
                        />
                      ))}
                    </span>
                    <span>{formatVisitDate(review.visitDate)}</span>
                  </div>
                </div>
                <ReportForm businessId={business.id} label="Report review" reviewId={review.id} />
              </div>

              {review.title ? (
                <h3 className="mt-5 text-[1.3rem] font-semibold text-[#162033]">{review.title}</h3>
              ) : null}
              <p className="mt-3 text-[1rem] leading-8 text-[#66768c]">{review.body}</p>
              {review.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.tags.map((tag) => (
                    <span
                      key={`${review.id}-${tag}`}
                      className="rounded-full border border-[#e4ebf4] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f7f94]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {review.photoUrls.length > 0 ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {review.photoUrls.map((photoUrl) => (
                    <Image
                      key={photoUrl}
                      alt={`Review photo for ${business.name}`}
                      className="h-56 w-full rounded-[24px] object-cover"
                      height={420}
                      src={photoUrl}
                      unoptimized
                      width={520}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {activeTab === "photos" ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {photoGallery.map((photo, index) => {
            if (photo.kind === "image") {
              return (
                <Image
                  key={`${photo.url}-${index}`}
                  alt={`${business.name} photo`}
                  className="h-72 w-full rounded-[30px] border border-[#e7edf5] object-cover shadow-[0_16px_40px_rgba(34,51,84,0.06)]"
                  height={520}
                  src={photo.url}
                  unoptimized
                  width={520}
                />
              );
            }

            return (
              <article
                key={`${photo.title}-${index}`}
                className="flex h-72 items-end rounded-[30px] border border-[#e7edf5] p-6 shadow-[0_16px_40px_rgba(34,51,84,0.06)]"
                style={{ backgroundImage: `linear-gradient(135deg, ${photo.from}, ${photo.to})` }}
              >
                <div className="rounded-[20px] bg-white/88 px-4 py-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f7f94]">Gallery</p>
                  <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#152033]">{photo.title}</p>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {activeTab === "hours" ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
          <article className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
            <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">Opening Hours</h2>
            <div className="mt-6 divide-y divide-[#eef2f7]">
              {detail.openingHours.map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between gap-4 py-4 text-[1.02rem]">
                  <span className="font-medium text-[#1d2940]">{day}</span>
                  <span className="text-[#66768c]">{hours}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[30px] border border-[#e7edf5] bg-white p-8 shadow-[0_16px_40px_rgba(34,51,84,0.06)]">
            <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#121c30]">Need a correction?</h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#66768c]">
              If these hours look off, let us know through a report so the listing can be reviewed and updated.
            </p>
            <div className="mt-6">
              <ReportForm businessId={business.id} label="Report listing details" />
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}
