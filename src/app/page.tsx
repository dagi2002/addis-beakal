import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Coffee,
  Drum,
  Flame,
  Heart,
  Hotel,
  MapPin,
  Music4,
  Scissors,
  Sparkles,
  Star,
  Stethoscope,
  Utensils
} from "lucide-react";

import { BusinessCard } from "@/components/business/business-card";
import { SiteShell } from "@/components/layout/site-shell";
import { getHomePageData } from "@/features/home/service";
import { cn } from "@/lib/utils";
import { getViewerId } from "@/lib/viewer";

const categoryCards = [
  { label: "Restaurants", description: "Traditional & modern cuisine", href: "/discover?query=restaurant", icon: Utensils, color: "bg-[#fff4e9] text-[#d86e39]" },
  { label: "Cafes", description: "Coffee & buna spots", href: "/discover?category=coffee", icon: Coffee, color: "bg-[#fff6db] text-[#f4a62a]" },
  { label: "Hotels", description: "Stay in comfort", href: "/discover?query=hotel", icon: Hotel, color: "bg-[#edf2ff] text-[#5578e8]" },
  { label: "Salons", description: "Hair & beauty", href: "/discover?query=salon", icon: Sparkles, color: "bg-[#fdebf5] text-[#e0569b]" },
  { label: "Barbers", description: "Fresh cuts & styles", href: "/discover?query=barber", icon: Scissors, color: "bg-[#eef2f8] text-[#4e607a]" },
  { label: "Gyms", description: "Fitness & wellness", href: "/discover?query=gym", icon: Activity, color: "bg-[#edf9f2] text-[#39a379]" },
  { label: "Clinics", description: "Health & care", href: "/discover?query=clinic", icon: Stethoscope, color: "bg-[#ecf9ff] text-[#42a9c2]" },
  { label: "Bakery", description: "Fresh baked goods", href: "/discover?query=bakery", icon: Heart, color: "bg-[#fff6d7] text-[#d9a11f]" },
  { label: "Live Music", description: "Nightlife & culture", href: "/discover?query=music", icon: Music4, color: "bg-[#f3edff] text-[#8b5fe4]" },
  { label: "Culture", description: "Arts & events", href: "/discover?category=culture", icon: Drum, color: "bg-[#fceef0] text-[#d46b78]" }
] as const;

const curatedTags = [
  "Best Buna",
  "Fasting-Friendly",
  "Trending Now",
  "Strong WiFi",
  "Date Spots",
  "Family-Friendly",
  "Live Music",
  "Open Late"
];

export default async function HomePage() {
  const viewerId = await getViewerId();
  const data = await getHomePageData(viewerId);

  return (
    <SiteShell className="pb-2 pt-2" compactMain>
      <section className="dark-panel grain-overlay overflow-hidden rounded-[40px] px-6 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/88">
              <Flame className="h-4 w-4 text-[#f3bf74]" />
              Addis discovery, reimagined
            </div>
            <div className="max-w-4xl">
              <h1 className="page-title max-w-4xl text-white">
                A richer way to find
                <br />
                the places that make
                <br />
                <span className="text-[#f3bf74]">Addis feel alive.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
                Discover neighborhood favorites, polished destinations, and everyday essentials
                through a warmer city guide built around real context instead of generic listings.
              </p>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur lg:max-w-[760px] lg:grid-cols-[1fr_220px_170px]">
              <div className="rounded-[22px] border border-white/8 bg-white/8 px-4 py-4 text-sm text-white/68">
                Restaurants, buna spots, salons, bakeries, culture...
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/8 px-4 py-4 text-sm text-white/58">
                Bole, Piassa, Mexico, Kazanchis
              </div>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-[var(--accent)] px-6 py-4 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
                href="/discover"
              >
                Start exploring
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {categoryCards.slice(0, 8).map((category) => (
                <Link
                  key={category.label}
                  className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-medium text-white/88 transition hover:bg-white/14"
                  href={category.href}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[32px] border border-white/10 bg-[rgba(255,246,233,0.9)] p-5 text-[#2b1a10]">
              <p className="section-label">Pulse</p>
              <h2 className="mt-3 font-[var(--font-heading)] text-[2rem] leading-[0.98] tracking-[-0.05em]">
                Places people are actually talking about this week.
              </h2>
              <div className="mt-5 space-y-3">
                {data.featuredBusinesses.slice(0, 3).map((business, index) => (
                  <div
                    key={business.id}
                    className="rounded-[22px] border border-[rgba(62,46,31,0.1)] bg-white/72 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        0{index + 1}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[var(--gold)]">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {business.rating.toFixed(1)}
                      </div>
                    </div>
                    <p className="mt-2 font-[var(--font-heading)] text-[1.45rem] leading-[1.02] tracking-[-0.04em]">
                      {business.name}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {business.category} · {business.neighborhood}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5">
              <p className="section-label">Signals</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Businesses", data.stats.businessCount.toLocaleString()],
                  ["Published reviews", data.stats.reviewCount.toLocaleString()],
                  ["Neighborhoods", data.stats.neighborhoodCount.toLocaleString()],
                  ["Saves", data.stats.saveCount.toLocaleString()]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[22px] bg-[rgba(255,255,255,0.58)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#23170f]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[36px] p-6 lg:p-8">
          <p className="section-label">Browse with intent</p>
          <h2 className="mt-4 editorial-title">Choose a lane, then follow the strongest local signals.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {categoryCards.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.label}
                  className="group rounded-[26px] border border-[rgba(62,46,31,0.1)] bg-[rgba(255,255,255,0.62)] p-5 transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(65,45,28,0.12)]"
                  href={category.href}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${category.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#23170f]">
                    {category.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{category.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-strong)]">
                    Browse
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="dark-panel rounded-[36px] p-6 lg:p-8">
          <p className="section-label text-[#f3bf74]">Curated for Addis</p>
          <h2 className="mt-4 font-[var(--font-heading)] text-[2.7rem] leading-[0.96] tracking-[-0.05em] text-white">
            Discovery should feel like city knowledge, not database plumbing.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64">
            Start from the cues people actually use here: coffee worth the stop, places good for
            families, corners with strong WiFi, and destinations that still feel like Addis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {curatedTags.map((tag, index) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full border px-4 py-2.5 text-sm font-semibold text-white/88",
                  index % 4 === 0 && "border-[#f3bf74]/30 bg-[#f3bf74]/12",
                  index % 4 === 1 && "border-[#84b79f]/30 bg-[#84b79f]/12",
                  index % 4 === 2 && "border-[#f1a48a]/28 bg-[#f1a48a]/10",
                  index % 4 === 3 && "border-white/12 bg-white/8"
                )}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.recentReviews.slice(0, 4).map((review) => (
              <div key={review.id} className="rounded-[24px] border border-white/8 bg-white/8 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/46">{review.businessName}</p>
                <p className="mt-3 font-medium">{review.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/64">{review.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">Right now</p>
            <h2 className="editorial-title mt-3">Places getting pulled into people’s rotation.</h2>
          </div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]"
            href="/discover"
          >
            See all discovery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {data.featuredBusinesses.slice(0, 6).map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[36px] p-6 lg:p-8">
          <p className="section-label">Top rated</p>
          <h2 className="mt-4 editorial-title">When quality matters more than novelty.</h2>
          <div className="mt-8 grid gap-5">
            {data.topRatedBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>

        <div className="dark-panel rounded-[36px] p-6 lg:p-8">
          <p className="section-label text-[#f3bf74]">For business owners</p>
          <h2 className="mt-4 font-[var(--font-heading)] text-[2.8rem] leading-[0.95] tracking-[-0.05em] text-white">
            Claim your listing before someone else defines your first impression.
          </h2>
          <p className="mt-5 text-base leading-8 text-white/66">
            Own the page, respond to reviews, and turn local discovery into an advantage instead of
            a missed opportunity.
          </p>
          <div className="mt-8 grid gap-4">
            {[
              "Control your public business story",
              "Respond directly to customer reviews",
              "Show updated details and stronger trust signals"
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/8 p-4 text-white/82">
                <MapPin className="mt-0.5 h-4 w-4 text-[#f3bf74]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
              href="/claim-business"
            >
              Claim your business
            </Link>
            <Link
              className="rounded-full border border-white/12 bg-white/8 px-6 py-3 text-sm font-bold text-white/88"
              href="/discover"
            >
              Explore first
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
