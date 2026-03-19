import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import type { BusinessCardData } from "@/features/businesses/types";
import { formatRating } from "@/lib/utils";
import { SaveButton } from "@/components/business/save-button";

type BusinessCardProps = {
  business: BusinessCardData;
};

export function BusinessCard({ business }: BusinessCardProps) {
  const stars = Math.round(business.rating);

  return (
    <article className="glass-panel overflow-hidden rounded-[30px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(78,52,29,0.18)]">
      <div
        className="relative h-56"
        style={{
          backgroundImage: `radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 22%), linear-gradient(135deg, ${business.coverFrom}, ${business.coverTo})`
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,15,8,0.05),rgba(29,15,8,0.42))]" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[rgba(255,248,239,0.86)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              {business.category}
            </span>
            <span className="rounded-full border border-white/18 bg-[rgba(27,18,11,0.22)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/88">
              {business.neighborhood}
            </span>
          </div>
        </div>
        <SaveButton
          businessId={business.id}
          compact
          className="absolute right-3 top-3"
          initialSaved={business.isSaved}
          initialSaveCount={business.saveCount}
        />
      </div>
      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <Link
              href={`/business/${business.slug}`}
              className="font-[var(--font-heading)] text-[1.85rem] leading-[1.02] tracking-[-0.04em] text-[#23170f]"
            >
              {business.name}
            </Link>
            <span className="rounded-full bg-[rgba(54,88,71,0.12)] px-3 py-1 text-xs font-semibold text-[var(--moss)]">
              {business.priceTier}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-strong)]">
            <span className="flex items-center gap-1 text-[var(--gold)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`${business.id}-${index}`}
                  className={index < stars ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5 text-[rgba(32,22,15,0.14)]"}
                />
              ))}
            </span>
            <span className="font-semibold">{formatRating(business.rating)}</span>
            <span className="text-[var(--muted)]">{business.reviewCount} reviews</span>
          </div>
        </div>
        <p className="text-sm leading-7 text-[var(--muted)]">{business.shortDescription}</p>
        <div className="grid gap-3 rounded-[22px] bg-[rgba(255,255,255,0.55)] p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="flex items-start gap-2 text-sm text-[var(--muted-strong)]">
            <MapPin className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
            <span>{business.address}</span>
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {business.saveCount} saves
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {business.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[rgba(62,46,31,0.1)] bg-[rgba(255,248,239,0.84)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
