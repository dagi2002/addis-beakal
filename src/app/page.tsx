import Link from "next/link";
import {
  ArrowRight,
  Flame,
  MapPin,
  Star,
  Search
} from "lucide-react";

import { BusinessCard } from "@/components/business/business-card";
import { SiteShell } from "@/components/layout/site-shell";
import { getHomePageData } from "@/features/home/service";
import { getViewerId } from "@/lib/viewer";

const categoryCards = [
  { emoji: "🍛", label: "Restaurants", description: "Traditional & modern cuisine", href: "/discover?category=restaurants", accent: "bg-[#fff1e4] text-[#ce6a33]" },
  { emoji: "☕", label: "Cafes", description: "Coffee & buna spots", href: "/discover?category=cafes", accent: "bg-[#fff6df] text-[#df9524]" },
  { emoji: "🏨", label: "Hotels", description: "Stay in comfort", href: "/discover?category=hotels", accent: "bg-[#eef3ff] text-[#5f78d6]" },
  { emoji: "💇", label: "Salons", description: "Hair & beauty", href: "/discover?category=salons", accent: "bg-[#fdebf4] text-[#ce558f]" },
  { emoji: "✂️", label: "Barbers", description: "Fresh cuts & styles", href: "/discover?category=barbers", accent: "bg-[#eff3f8] text-[#4f607a]" },
  { emoji: "💪", label: "Gyms", description: "Fitness & wellness", href: "/discover?category=gyms", accent: "bg-[#edf9f2] text-[#37996f]" },
  { emoji: "🏥", label: "Clinics", description: "Health & care", href: "/discover?category=clinics", accent: "bg-[#edf9ff] text-[#3798bf]" },
  { emoji: "💊", label: "Pharmacy", description: "Medicine & health", href: "/discover?category=pharmacy", accent: "bg-[#eef6ff] text-[#4f89cf]" },
  { emoji: "🍞", label: "Bakeries", description: "Fresh baked goods", href: "/discover?category=bakeries", accent: "bg-[#fff5df] text-[#cb9b31]" },
  { emoji: "🍸", label: "Bars", description: "Drinks & nightlife", href: "/discover?category=bars", accent: "bg-[#f4ebff] text-[#8a57cb]" },
  { emoji: "🧖", label: "Spas", description: "Relax & rejuvenate", href: "/discover?category=spas", accent: "bg-[#eaf8f2] text-[#36846c]" },
  { emoji: "🚗", label: "Car Services", description: "Maintenance & repair", href: "/discover?category=car-services", accent: "bg-[#eef1f5] text-[#566778]" }
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
      <section className="dark-panel grain-overlay overflow-hidden rounded-[40px] px-6 py-5 lg:px-8 lg:py-6">
        <div className="grid gap-6 lg:grid-cols-[1.14fr_0.86fr] lg:items-center">
          <div className="space-y-5 text-white">
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
              <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-white/78 lg:text-[1.02rem]">
                Discover neighborhood favorites, polished destinations, and everyday essentials
                through a warmer city guide built around real context instead of generic listings.
              </p>
            </div>

            <form
              action="/discover"
              className="grid w-full gap-3 rounded-[28px] border border-white/12 bg-white/8 p-2.5 backdrop-blur lg:grid-cols-[minmax(0,1.6fr)_240px_210px]"
            >
              <label className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white px-4 py-3 text-sm text-[var(--muted)] shadow-[0_16px_30px_rgba(12,10,7,0.16)]">
                <Search className="h-4 w-4 text-[var(--accent)]" />
                <input
                  className="w-full bg-transparent text-[color:var(--surface-dark)] outline-none placeholder:text-[var(--muted)]"
                  name="query"
                  placeholder="Search restaurants, cafes, clinics, salons..."
                  type="text"
                />
              </label>
              <select
                className="rounded-[20px] border border-white/10 bg-white px-4 py-3 text-sm text-[color:var(--surface-dark)] shadow-[0_16px_30px_rgba(12,10,7,0.16)] outline-none"
                name="neighborhood"
                defaultValue=""
              >
                <option value="">All neighborhoods</option>
                {data.neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.slug}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(180deg,#f7a31c,#ef7d16)] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_30px_rgba(239,125,22,0.28)] transition hover:translate-y-[-1px] hover:brightness-105"
                type="submit"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/18">
                  <Search className="h-3.5 w-3.5" />
                </span>
                Search now
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-[32px] border border-white/10 bg-[rgba(255,246,233,0.9)] p-4 text-[#2b1a10]">
              <p className="section-label">Pulse</p>
              <h2 className="mt-3 font-[var(--font-heading)] text-[1.7rem] leading-[0.98] tracking-[-0.05em]">
                Places people are actually talking about this week.
              </h2>
              <div className="mt-4 space-y-3">
                {data.featuredBusinesses.slice(0, 3).map((business, index) => (
                  <div
                    key={business.id}
                    className="rounded-[22px] border border-[rgba(62,46,31,0.1)] bg-white/72 p-3.5"
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
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Businesses Listed", data.stats.businessCount.toLocaleString()],
          ["Published Reviews", data.stats.reviewCount.toLocaleString()],
          ["Active Users", data.stats.userCount.toLocaleString()]
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-[28px] px-5 py-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--surface-dark)]">{value}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-[36px] p-6 lg:p-8">
        <p className="section-label">Browse By Category</p>
        <h2 className="mt-4 editorial-title">What Are You Looking For?</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categoryCards.map((category) => (
            <Link
              key={category.label}
              className="group rounded-[26px] border border-[rgba(62,46,31,0.1)] bg-[rgba(255,255,255,0.74)] p-5 transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(65,45,28,0.12)]"
              href={category.href}
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${category.accent}`}>
                <span aria-hidden="true">{category.emoji}</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#23170f]">{category.label}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[36px] p-6 lg:p-8">
          <p className="section-label">Curated For Addis</p>
          <h2 className="mt-4 editorial-title">Find Exactly What You Need</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {curatedTags.map((tag) => (
              <Link
                key={tag}
                className="rounded-full border border-[rgba(62,46,31,0.12)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--surface-dark)] shadow-[0_10px_24px_rgba(49,35,22,0.08)] transition hover:border-[var(--accent-soft)] hover:bg-[#fff8f1]"
                href={`/discover?query=${encodeURIComponent(tag)}`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="dark-panel rounded-[36px] p-6 lg:p-8">
          <p className="section-label text-[#f3bf74]">Recent local signal</p>
          <h2 className="mt-4 font-[var(--font-heading)] text-[2.7rem] leading-[0.96] tracking-[-0.05em] text-white">
            Discovery should feel like city knowledge, not database plumbing.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
            Start from the cues people actually use here: coffee worth the stop, places good for
            families, corners with strong WiFi, and destinations that still feel like Addis.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.recentReviews.slice(0, 4).map((review) => (
              <div key={review.id} className="rounded-[24px] border border-white/8 bg-white/8 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/46">{review.businessName}</p>
                <p className="mt-3 font-medium">{review.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/76">{review.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">Popular Right Now</p>
            <h2 className="editorial-title mt-3">Trending in Addis</h2>
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
          <p className="section-label">Top Rated</p>
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
