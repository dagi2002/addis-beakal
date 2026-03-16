import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import type { BusinessCardData } from "@/features/businesses/types";
import { formatRating } from "@/lib/utils";
import { SaveButton } from "@/components/business/save-button";
import { Pill } from "@/components/shared/pill";

type BusinessCardProps = {
  business: BusinessCardData;
};

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-black/8 bg-white/80 shadow-soft backdrop-blur">
      <div
        className="relative h-48 bg-hero-grid"
        style={{
          backgroundImage: `linear-gradient(135deg, ${business.coverFrom}, ${business.coverTo})`
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_30%)]" />
        <div className="absolute left-5 top-5 flex items-center gap-2">
          <Pill>{business.category}</Pill>
          <Pill>{business.neighborhood}</Pill>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Link href={`/business/${business.slug}`} className="text-xl font-semibold tracking-tight">
              {business.name}
            </Link>
            <p className="text-sm leading-6 text-black/65">{business.shortDescription}</p>
          </div>
          <SaveButton
            businessId={business.id}
            initialSaved={business.isSaved}
            initialSaveCount={business.saveCount}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-black/60">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-3 py-2">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {formatRating(business.rating)} · {business.reviewCount} reviews
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-3 py-2">
            <MapPin className="h-4 w-4" />
            {business.address}
          </span>
          <span className="rounded-full bg-black/5 px-3 py-2">{business.priceTier}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {business.tags.map((tag) => (
            <Pill key={tag}>{tag}</Pill>
          ))}
        </div>
      </div>
    </article>
  );
}
