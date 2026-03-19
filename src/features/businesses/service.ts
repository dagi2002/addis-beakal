import { notFound } from "next/navigation";

import {
  getReviewDistribution,
  mapBusinessCardData,
  resolvePublicReviews
} from "@/features/businesses/queries";
import { readDatabase } from "@/server/database";

function buildBusinessExperience(slug: string, category: string, neighborhood: string, address: string) {
  const categoryKey = category.toLowerCase();

  const defaults = {
    heroImageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    phone: "+251111234567",
    contactAddress: address,
    openToday: "7:00 AM - 7:00 PM",
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
      openToday: "11:00 AM - 10:00 PM",
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

export async function getBusinessPageData(slug: string, viewerId?: string | null) {
  const database = await readDatabase();
  const business = database.businesses.find((item) => item.slug === slug);

  if (!business) {
    notFound();
  }

  const category = database.categories.find((item) => item.id === business.categoryId);
  const neighborhood = database.neighborhoods.find((item) => item.id === business.neighborhoodId);
  const reviews = resolvePublicReviews(database, business.id);
  const viewerHasReviewed = Boolean(
    viewerId && database.reviews.find((review) => review.businessId === business.id && review.authorId === viewerId)
  );
  const experience = buildBusinessExperience(
    slug,
    category?.name ?? "Unknown",
    neighborhood?.name ?? "Unknown",
    business.address
  );
  const relatedBusinesses = database.businesses
    .filter((item) => item.id !== business.id && item.categoryId === business.categoryId)
    .slice(0, 3)
    .map((item) => mapBusinessCardData(item, database, viewerId));

  return {
    business: mapBusinessCardData(business, database, viewerId),
    detail: {
      longDescription: business.longDescription,
      address: business.address,
      category: category?.name ?? "Unknown",
      neighborhood: neighborhood?.name ?? "Unknown",
      ownerName: business.ownerUserId
        ? database.users.find((user) => user.id === business.ownerUserId)?.displayName
        : undefined,
      phone: experience.phone,
      contactAddress: experience.contactAddress,
      openToday: experience.openToday,
      openingHours: experience.openingHours,
      services: experience.services,
      photos: experience.photos,
      heroImageUrl: experience.heroImageUrl,
      isVerified: Boolean(business.ownerUserId) || business.reviewCount >= 2,
      isFeatured: slug.includes("tomoca") || business.saveCount >= 2 || business.rating >= 4.5,
      viewCount: business.reviewCount * 311 + business.saveCount * 91 + 1000
    },
    reviews,
    reviewDistribution: getReviewDistribution(reviews),
    relatedBusinesses,
    viewerState: {
      isAuthenticated: Boolean(viewerId),
      hasReviewed: viewerHasReviewed,
      isClaimed: Boolean(business.ownerUserId)
    }
  };
}
