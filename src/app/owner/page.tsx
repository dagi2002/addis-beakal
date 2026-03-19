import Link from "next/link";

import { OwnerListingEditor } from "@/components/owner/owner-listing-editor";
import { OwnerReviewActions } from "@/components/owner/owner-review-actions";
import { SiteShell } from "@/components/layout/site-shell";
import { getOwnerDashboardData } from "@/features/owner/service";
import { requireOwnerActor } from "@/lib/viewer";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export default async function OwnerPage() {
  const actor = await requireOwnerActor("/owner");
  const data = await getOwnerDashboardData(actor);

  return (
    <SiteShell className="gap-8">
      <section className="dark-panel relative overflow-hidden rounded-[40px] px-7 py-8 sm:px-9 sm:py-9">
        <div className="grain-overlay" />
        <div className="relative space-y-4">
          <p className="section-label text-white/56">Owner dashboard</p>
          <h1 className="editorial-title max-w-3xl text-[clamp(2.7rem,5vw,4.7rem)] leading-[0.96] text-white">
            See what people do, respond in public, and follow up privately when it matters.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
            Visits, saves, reviews, and map intent now come from the same engagement system that powers
            the public business pages and the admin moderation queue.
          </p>
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/8 p-4 text-white">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">1. Find the review</p>
              <p className="mt-2 text-sm leading-6 text-white/82">
                Open the response queue below and choose the review you want to handle.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/8 p-4 text-white">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">2. Reply in public</p>
              <p className="mt-2 text-sm leading-6 text-white/82">
                Use <span className="font-semibold text-white">Reply below review</span> to post a public owner response.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/8 p-4 text-white">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">3. Follow up privately</p>
              <p className="mt-2 text-sm leading-6 text-white/82">
                Use <span className="font-semibold text-white">Send private message</span> when you need a 1:1 conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {data.businesses.map((business) => (
        <section key={business.id} className="space-y-6">
          <div className="glass-panel rounded-[34px] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="section-label">Owned business</p>
                <h2 className="mt-3 font-[var(--font-heading)] text-4xl text-[color:var(--surface-dark)]">
                  {business.name}
                </h2>
                <p className="mt-2 text-sm text-[color:var(--ink-soft)]">{business.address}</p>
                {business.claimedAt ? (
                  <p className="mt-3 text-sm text-[color:var(--ink-soft)]">
                    Claim approved on {formatDate(business.claimedAt)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="rounded-full border border-black/10 bg-white/72 px-5 py-3 text-sm font-semibold text-[color:var(--surface-dark)] transition hover:bg-white"
                  href={`/business/${business.slug}`}
                >
                  View listing
                </Link>
                {business.ownerMessagingDisabledAt ? (
                  <span className="rounded-full bg-[#fff3f1] px-4 py-3 text-sm font-semibold text-[#b7483a]">
                    Messaging suspended
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Visits</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                  {business.pageVisitsLast30Days}
                </p>
                <p className="mt-2 text-xs text-[color:var(--ink-soft)]">Last 30 days</p>
              </div>
              <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">New saves</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                  {business.savesLast30Days}
                </p>
                <p className="mt-2 text-xs text-[color:var(--ink-soft)]">Last 30 days</p>
              </div>
              <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">New reviews</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                  {business.reviewsLast30Days}
                </p>
                <p className="mt-2 text-xs text-[color:var(--ink-soft)]">Last 30 days</p>
              </div>
              <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Map intent</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                  {business.mapIntentLast30Days}
                </p>
                <p className="mt-2 text-xs text-[color:var(--ink-soft)]">Maps and directions</p>
              </div>
              <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Needs reply</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--surface-dark)]">
                  {business.unrepliedReviewCount}
                </p>
                <p className="mt-2 text-xs text-[color:var(--ink-soft)]">Published reviews</p>
              </div>
            </div>
          </div>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="glass-panel rounded-[34px] p-6">
              <p className="section-label">Response queue</p>
              <h3 className="mt-3 font-[var(--font-heading)] text-3xl text-[color:var(--surface-dark)]">
                Recent reviews that need owner context
              </h3>
              <div className="mt-6 space-y-5">
                {business.responseQueue.length > 0 ? (
                  business.responseQueue.map((review) => (
                    <article key={review.id} className="rounded-[28px] border border-black/8 bg-white/78 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">
                            {review.reviewAuthor?.displayName ?? review.authorName} · {formatDate(review.createdAt)}
                          </p>
                          <h4 className="mt-3 text-2xl font-semibold text-[color:var(--surface-dark)]">
                            {review.title || "Untitled review"}
                          </h4>
                          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
                            Rating {review.rating}.0 · {review.status}
                          </p>
                          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{review.body}</p>
                        </div>
                        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-strong)]">
                          {review.ownerReply ? "Replied" : "Needs reply"}
                        </span>
                      </div>

                      <div className="mt-5">
                        <OwnerReviewActions
                          businessId={business.id}
                          messagingDisabled={Boolean(business.ownerMessagingDisabledAt)}
                          ownerReply={review.ownerReply}
                          reviewId={review.id}
                          thread={review.thread}
                        />
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-black/10 bg-white/60 p-8 text-center text-[color:var(--ink-soft)]">
                    No published reviews yet for this listing.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-[34px] p-6">
              <p className="section-label">Listing health</p>
              <h3 className="mt-3 font-[var(--font-heading)] text-3xl text-[color:var(--surface-dark)]">
                Completeness signals
              </h3>
              <div className="mt-6 space-y-3">
                <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Hours</p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--surface-dark)]">
                    {business.listingHealth.hasHours ? "Added" : "Missing"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Photos</p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--surface-dark)]">
                    {business.listingHealth.photoCount} uploaded
                  </p>
                </div>
                <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Description</p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--surface-dark)]">
                    {business.listingHealth.hasDescription ? "Ready" : "Needs detail"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/42">Map link</p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--surface-dark)]">
                    {business.listingHealth.hasMapLink ? "Connected" : "Missing"}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <OwnerListingEditor
                  businessId={business.id}
                  initialGoogleMapsUrl={business.googleMapsUrl}
                  initialLongDescription={business.longDescription}
                  initialOpeningHours={business.openingHours ?? []}
                  initialPhotoUrls={business.photoUrls ?? []}
                  initialShortDescription={business.shortDescription}
                />
              </div>
            </div>
          </section>
        </section>
      ))}

      {data.businesses.length === 0 ? (
        <div className="glass-panel rounded-[32px] border-dashed p-10 text-center text-[color:var(--ink-soft)]">
          No owned businesses yet. Claim a business and have an admin approve it to unlock this dashboard.
        </div>
      ) : null}
    </SiteShell>
  );
}
