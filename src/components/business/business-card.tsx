import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import type { BusinessCardData } from "@/features/businesses/types";
import { formatRating } from "@/lib/utils";
import { SaveButton } from "@/components/business/save-button";
import { cn } from "@/lib/utils";

type BusinessCardProps = {
  business: BusinessCardData;
  variant?: "editorial" | "market";
  featured?: boolean;
};

export function BusinessCard({
  business,
  variant = "editorial",
  featured = false
}: BusinessCardProps) {
  const stars = Math.round(business.rating);
  const isMarket = variant === "market";

  return (
    <article
      className={cn(
        "group relative overflow-hidden transition duration-300",
        isMarket
          ? "rounded-[30px] border border-[#e4e9f0] bg-white shadow-[0_16px_40px_rgba(39,52,76,0.08)] hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(39,52,76,0.12)]"
          : "glass-panel rounded-[30px] hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(78,52,29,0.18)]"
      )}
    >
      <Link
        aria-label={`Open ${business.name}`}
        className="absolute inset-0 z-10 rounded-[30px]"
        href={`/business/${business.slug}`}
      />
      <div
        className={cn("relative", isMarket ? "h-64" : "h-56")}
        style={{
          backgroundImage: `radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 22%), linear-gradient(135deg, ${business.coverFrom}, ${business.coverTo})`
        }}
      >
        <div
          className={cn(
            "absolute inset-0",
            isMarket
              ? "bg-[linear-gradient(180deg,rgba(29,15,8,0.02),rgba(29,15,8,0.28))]"
              : "bg-[linear-gradient(180deg,rgba(29,15,8,0.05),rgba(29,15,8,0.42))]"
          )}
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                isMarket
                  ? "bg-[rgba(255,248,239,0.96)] text-[#ef7d16]"
                  : "bg-[rgba(255,248,239,0.86)] text-[var(--accent-strong)]"
              )}
            >
              {business.category}
            </span>
            {featured ? (
              <span className="rounded-full bg-[#ff9f0a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                Featured
              </span>
            ) : null}
          </div>
        </div>
        <SaveButton
          businessId={business.id}
          compact
          className="absolute right-3 top-3 z-20"
          initialSaved={business.isSaved}
          initialSaveCount={business.saveCount}
        />
      </div>
      <div className={cn("space-y-5 p-5", isMarket && "space-y-4 p-6")}>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <p
              className={cn(
                "leading-[1.02] tracking-[-0.04em] text-[#23170f] transition group-hover:text-[var(--accent-strong)]",
                isMarket
                  ? "text-[2rem] font-semibold"
                  : "font-[var(--font-heading)] text-[1.85rem]"
              )}
            >
              {business.name}
            </p>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                isMarket
                  ? "bg-[#f3f6fb] text-[#5f7086]"
                  : "bg-[rgba(54,88,71,0.12)] text-[var(--moss)]"
              )}
            >
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
        {!isMarket ? <p className="text-sm leading-7 text-[var(--muted)]">{business.shortDescription}</p> : null}
        <div
          className={cn(
            "grid gap-3 rounded-[22px] p-4 sm:grid-cols-[1fr_auto] sm:items-end",
            isMarket ? "border border-[#eef2f7] bg-[#fbfcfe]" : "bg-[rgba(255,255,255,0.55)]"
          )}
        >
          <div className="flex items-start gap-2 text-sm text-[var(--muted-strong)]">
            <MapPin className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
            <span>{business.address}</span>
          </div>
          {!isMarket ? <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{business.saveCount} saves</div> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {business.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
                isMarket
                  ? "border border-[#e8edf4] bg-[#f7f9fc] text-[#6a7789]"
                  : "border border-[rgba(62,46,31,0.1)] bg-[rgba(255,248,239,0.84)] text-[var(--muted-strong)]"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
