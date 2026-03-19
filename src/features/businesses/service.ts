import { notFound } from "next/navigation";
import { z } from "zod";

import { BUSINESS_WEEKDAYS } from "@/features/businesses/catalog";
import {
  getReviewDistribution,
  mapBusinessCardData,
  resolvePublicReviews
} from "@/features/businesses/queries";
import type { Business } from "@/features/businesses/types";
import type { AppActor } from "@/server/auth/actor";
import { assertIsAdmin } from "@/server/auth/policies";
import { readDatabase, updateDatabase } from "@/server/database";

type BusinessExperience = {
  heroImageUrl: string;
  contactAddress: string;
  openingHours: [string, string][];
  services: Array<{ name: string; priceEtb: number; description: string }>;
  photos: Array<{ title: string; url?: string; from?: string; to?: string }>;
};

const openingHoursSchema = z.array(
  z.tuple([z.string().trim().min(1), z.string().trim().min(1).max(48)])
).length(7);

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  priceEtb: z.coerce.number().min(0).max(100_000),
  description: z.string().trim().min(4).max(220)
});

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2).max(80),
  categoryId: z.string().min(1),
  neighborhoodId: z.string().min(1),
  address: z.string().trim().min(4).max(120),
  googleMapsUrl: z.string().trim().url("Enter a valid Google Maps URL.").optional().or(z.literal("")),
  bannerImageUrl: z.string().trim().url("Enter a valid banner image URL.").optional().or(z.literal("")),
  photoUrls: z.array(z.string().trim().url("Enter valid photo URLs.")).max(8).default([]),
  openingHours: openingHoursSchema,
  services: z.array(serviceSchema).min(1).max(12),
  features: z.array(z.string().trim().min(1).max(32)).max(20).default([]),
  priceTier: z.enum(["$", "$$", "$$$", "$$$$"]),
  shortDescription: z.string().trim().min(20).max(140),
  longDescription: z.string().trim().min(40).max(900),
  tags: z.string().trim().max(160).default("")
});

export const saveBusinessSchema = createBusinessSchema.extend({
  businessId: z.string().trim().optional().or(z.literal(""))
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function createUniqueSlug(name: string, existingBusinesses: Business[]) {
  const baseSlug = slugify(name) || "business";
  const existingSlugs = new Set(existingBusinesses.map((business) => business.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let attempt = 2;
  while (existingSlugs.has(`${baseSlug}-${attempt}`)) {
    attempt += 1;
  }

  return `${baseSlug}-${attempt}`;
}

function resolveCoverPalette(categorySlug: string) {
  switch (categorySlug) {
    case "cafes":
      return { coverFrom: "#9a5f3d", coverTo: "#ecd1b8" };
    case "restaurants":
      return { coverFrom: "#1f6d5f", coverTo: "#9dd8c1" };
    case "bars":
      return { coverFrom: "#6f3f8f", coverTo: "#d7b0f1" };
    case "bakeries":
      return { coverFrom: "#d4a947", coverTo: "#f6dc8a" };
    case "hotels":
      return { coverFrom: "#7da7c7", coverTo: "#dce9f5" };
    case "salons":
      return { coverFrom: "#f0bfd4", coverTo: "#f9e6ef" };
    case "barbers":
      return { coverFrom: "#737f8c", coverTo: "#dee5eb" };
    case "gyms":
      return { coverFrom: "#7b8795", coverTo: "#d4dbe2" };
    case "clinics":
      return { coverFrom: "#8ec2d5", coverTo: "#eef8fc" };
    case "pharmacy":
      return { coverFrom: "#7ac4bb", coverTo: "#e4faf6" };
    case "spas":
      return { coverFrom: "#d7c6bb", coverTo: "#f4ebe4" };
    case "car-services":
      return { coverFrom: "#7b8fa4", coverTo: "#e3ebf3" };
    default:
      return { coverFrom: "#8b694f", coverTo: "#f0dfcf" };
  }
}

function buildBusinessExperience(
  slug: string,
  category: string,
  neighborhood: string,
  address: string
): BusinessExperience {
  const categoryKey = category.toLowerCase();

  const defaults: BusinessExperience = {
    heroImageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    contactAddress: address,
    openingHours: [
      ["Monday", "7:00 AM - 7:00 PM"],
      ["Tuesday", "7:00 AM - 7:00 PM"],
      ["Wednesday", "7:00 AM - 7:00 PM"],
      ["Thursday", "7:00 AM - 7:00 PM"],
      ["Friday", "7:00 AM - 7:00 PM"],
      ["Saturday", "8:00 AM - 8:00 PM"],
      ["Sunday", "8:00 AM - 6:00 PM"]
    ],
    services: [
      { name: "House Special", priceEtb: 180, description: "A dependable signature item for first-time visitors." },
      { name: "Local Favorite", priceEtb: 120, description: "Popular with regulars and strong on everyday value." }
    ],
    photos: [
      { title: "Storefront", from: "#d0d9e6", to: "#f5f7fb" },
      { title: "Interior", from: "#d8c3ac", to: "#f4ede3" },
      { title: "Signature Moment", from: "#9eb9c8", to: "#e7f0f4" }
    ]
  };

  if (slug.includes("tomoca") || categoryKey.includes("coffee") || categoryKey.includes("cafe")) {
    return {
      ...defaults,
      contactAddress: `${address}, ${neighborhood}`,
      heroImageUrl:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80",
      services: [
        { name: "Macchiato", priceEtb: 25, description: "Ethiopian-style espresso macchiato." },
        { name: "Buna (Black Coffee)", priceEtb: 20, description: "Traditional Ethiopian black coffee." },
        { name: "Coffee Beans (250g)", priceEtb: 180, description: "Freshly roasted Yirgacheffe beans." }
      ]
    };
  }

  if (categoryKey.includes("dining") || categoryKey.includes("restaurant")) {
    return {
      ...defaults,
      heroImageUrl:
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
      openingHours: defaults.openingHours.map(([day]) => [day, "11:00 AM - 10:00 PM"]),
      services: [
        { name: "Signature Plate", priceEtb: 320, description: "A flagship dish built for first-time diners." },
        { name: "Vegetarian Option", priceEtb: 240, description: "A reliable choice for lighter group meals." },
        { name: "Fresh Juice", priceEtb: 90, description: "A simple add-on that works any time of day." }
      ]
    };
  }

  if (categoryKey.includes("bakery") || categoryKey.includes("baker")) {
    return {
      ...defaults,
      heroImageUrl:
        "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&w=1600&q=80",
      services: [
        { name: "Butter Croissant", priceEtb: 60, description: "Fresh-baked and easy to take away." },
        { name: "Black Coffee", priceEtb: 35, description: "Simple pairing for quick morning stops." },
        { name: "Pastry Box", priceEtb: 240, description: "Best for small group pickups." }
      ]
    };
  }

  return defaults;
}

function getOpenToday(openingHours: [string, string][]) {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Africa/Addis_Ababa"
  }).format(new Date());

  return openingHours.find(([day]) => day === today)?.[1] ?? openingHours[0]?.[1] ?? "Hours not added";
}

export async function getBusinessPageData(slug: string, viewerId?: string | null) {
  const database = await readDatabase();
  const business = database.businesses.find((item) => item.slug === slug);

  if (!business) {
    notFound();
  }

  const category = database.categories.find((item) => item.id === business.categoryId);
  const neighborhood = database.neighborhoods.find((item) => item.id === business.neighborhoodId);
  const reviews = resolvePublicReviews(database, business.id).map((review) => {
    const ownerReply = database.ownerReviewReplies.find(
      (reply) => reply.reviewId === review.id && reply.status === "active"
    );

    return {
      ...review,
      ownerReply:
        ownerReply && business.ownerUserId
          ? {
              ...ownerReply,
              ownerName:
                database.users.find((user) => user.id === ownerReply.ownerUserId)?.displayName ?? "Business owner"
            }
          : null
    };
  });
  const viewerHasReviewed = Boolean(
    viewerId && database.reviews.find((review) => review.businessId === business.id && review.authorId === viewerId)
  );
  const experience = buildBusinessExperience(
    slug,
    category?.name ?? "Unknown",
    neighborhood?.name ?? "Unknown",
    business.address
  );
  const openingHours = business.openingHours?.length ? business.openingHours : experience.openingHours;
  const services = business.services?.length ? business.services : experience.services;
  const galleryPhotos =
    business.photoUrls?.length
      ? business.photoUrls.map((url, index) => ({
          title: `${business.name} photo ${index + 1}`,
          url
        }))
      : experience.photos;
  const relatedBusinesses = database.businesses
    .filter((item) => item.id !== business.id && item.categoryId === business.categoryId)
    .slice(0, 3)
    .map((item) => mapBusinessCardData(item, database, viewerId));

  return {
    business: mapBusinessCardData(business, database, viewerId),
    detail: {
      longDescription: business.longDescription,
      address: business.address,
      googleMapsUrl: business.googleMapsUrl,
      category: category?.name ?? "Unknown",
      neighborhood: neighborhood?.name ?? "Unknown",
      ownerName: business.ownerUserId
        ? database.users.find((user) => user.id === business.ownerUserId)?.displayName
        : undefined,
      contactAddress: experience.contactAddress,
      openToday: getOpenToday(openingHours),
      openingHours,
      services,
      photos: galleryPhotos,
      heroImageUrl: business.bannerImageUrl ?? experience.heroImageUrl,
      features: business.features ?? [],
      isVerified: Boolean(business.ownerUserId) || business.reviewCount >= 2,
      isFeatured: slug.includes("tomoca") || business.saveCount >= 2 || business.rating >= 4.5,
      viewCount: business.viewCount
    },
    reviews,
    reviewDistribution: getReviewDistribution(reviews),
    relatedBusinesses,
    viewerState: {
      isAuthenticated: Boolean(viewerId),
      hasReviewed: viewerHasReviewed,
      isClaimed: Boolean(business.ownerUserId),
      isOwner: Boolean(viewerId && business.ownerUserId === viewerId)
    }
  };
}

export async function saveBusiness(input: unknown, actor: AppActor) {
  assertIsAdmin(actor);
  const payload = saveBusinessSchema.parse(input);
  let createdBusiness: Business | null = null;

  await updateDatabase((current) => {
    const existingBusiness = payload.businessId
      ? current.businesses.find((business) => business.id === payload.businessId)
      : null;
    const category = current.categories.find((item) => item.id === payload.categoryId);
    const neighborhood = current.neighborhoods.find((item) => item.id === payload.neighborhoodId);

    if (payload.businessId && !existingBusiness) {
      throw new Error("Business not found.");
    }

    if (!category) {
      throw new Error("Category not found.");
    }

    if (!neighborhood) {
      throw new Error("Neighborhood not found.");
    }

    const slug = existingBusiness
      ? createUniqueSlug(
          payload.name,
          current.businesses.filter((business) => business.id !== existingBusiness.id)
        )
      : createUniqueSlug(payload.name, current.businesses);
    const tagList = payload.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 6);
    const photoUrls = payload.photoUrls.map((url) => url.trim()).filter(Boolean);
    const services = payload.services.map((service) => ({
      name: service.name.trim(),
      priceEtb: Number(service.priceEtb),
      description: service.description.trim()
    }));

    createdBusiness = {
      id: existingBusiness?.id ?? `biz-${slug}`,
      slug,
      name: payload.name.trim(),
      shortDescription: payload.shortDescription.trim(),
      longDescription: payload.longDescription.trim(),
      address: payload.address.trim(),
      googleMapsUrl: payload.googleMapsUrl?.trim() || undefined,
      bannerImageUrl: payload.bannerImageUrl?.trim() || undefined,
      priceTier: payload.priceTier,
      categoryId: category.id,
      neighborhoodId: neighborhood.id,
      features: payload.features,
      tags: tagList,
      photoUrls,
      openingHours: payload.openingHours.map(([day, hours], index) => [
        BUSINESS_WEEKDAYS[index] ?? day,
        hours.trim()
      ]),
      services,
      rating: existingBusiness?.rating ?? 0,
      reviewCount: existingBusiness?.reviewCount ?? 0,
      saveCount: existingBusiness?.saveCount ?? 0,
      viewCount: existingBusiness?.viewCount ?? 0,
      createdAt: existingBusiness?.createdAt ?? new Date().toISOString(),
      createdByUserId: existingBusiness?.createdByUserId ?? actor.userId!,
      ownerUserId: existingBusiness?.ownerUserId,
      claimedAt: existingBusiness?.claimedAt,
      ownerMessagingDisabledAt: existingBusiness?.ownerMessagingDisabledAt,
      ownerMessagingDisabledReason: existingBusiness?.ownerMessagingDisabledReason,
      ...(existingBusiness
        ? {
            coverFrom: existingBusiness.coverFrom,
            coverTo: existingBusiness.coverTo
          }
        : resolveCoverPalette(category.slug))
    };

    return {
      ...current,
      businesses: existingBusiness
        ? current.businesses.map((business) => (business.id === existingBusiness.id ? createdBusiness! : business))
        : [createdBusiness, ...current.businesses]
    };
  });

  if (!createdBusiness) {
    throw new Error("Could not create business.");
  }

  return createdBusiness;
}
