import publicData from "../../../data/mobile-public.json";

import {
  CURATED_HOME_FEATURES,
  formatBusinessFeatureLabel,
  formatPriceTierLabel,
  PRICE_TIER_OPTIONS
} from "@/features/businesses/catalog";
import {
  matchesBusinessQuery,
  sortBusinesses
} from "@/features/businesses/queries";
import type {
  AppDatabase,
  Business,
  BusinessCardData,
  DiscoverSort
} from "@/features/businesses/types";

export type MobileSession = {
  email: string;
  displayName: string;
  kind: "demo" | "local";
};

export type ExploreFilters = {
  query?: string;
  category?: string;
  neighborhood?: string;
  sort?: DiscoverSort;
};

type MobilePublicReview = {
  id: string;
  businessId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  tags: string[];
  visitDate: string;
  createdAt: string;
  photoUrls: string[];
};

type MobileBusinessCard = BusinessCardData;

const CATEGORY_META: Record<string, { emoji: string; description: string }> = {
  restaurants: { emoji: "🍛", description: "Traditional and modern dining rooms" },
  cafes: { emoji: "☕", description: "Coffee rituals, meetings, and buna stops" },
  hotels: { emoji: "🏨", description: "Refined stays and dependable comfort" },
  salons: { emoji: "💇", description: "Beauty, self-care, and polished appointments" },
  barbers: { emoji: "✂️", description: "Fresh cuts and clean neighborhood staples" },
  gyms: { emoji: "💪", description: "Training, recovery, and everyday movement" },
  clinics: { emoji: "🏥", description: "Care, checkups, and trusted visits" },
  pharmacy: { emoji: "💊", description: "Everyday essentials and medicine pickup" },
  bakeries: { emoji: "🍞", description: "Pastries, breakfast stops, and fresh bread" },
  bars: { emoji: "🍸", description: "Night energy, drinks, and city mood" },
  spas: { emoji: "🧖", description: "Quiet resets and warm wellness escapes" },
  "car-services": { emoji: "🚗", description: "Maintenance, repairs, and reliable service" }
};

const CATEGORY_ORDER = [
  "restaurants",
  "cafes",
  "hotels",
  "salons",
  "barbers",
  "gyms",
  "clinics",
  "pharmacy",
  "bakeries",
  "bars",
  "spas",
  "car-services"
] as const;

const NEIGHBORHOOD_ORDER = [
  "bole",
  "cmc",
  "piassa",
  "mexico",
  "kazanchis",
  "sarbet",
  "gerji",
  "megenagna",
  "lideta",
  "22",
  "ayat",
  "summit"
] as const;

const CATEGORY_HERO_IMAGES: Record<string, string> = {
  cafes:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80",
  restaurants:
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
  bakeries:
    "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&w=1600&q=80",
  bars:
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
  hotels:
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80",
  salons:
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80",
  barbers:
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1600&q=80",
  gyms:
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1600&q=80",
  clinics:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80",
  pharmacy:
    "https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=1600&q=80",
  spas:
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=80",
  "car-services":
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80"
};

const DEFAULT_OPENING_HOURS: [string, string][] = [
  ["Monday", "7:00 AM - 7:00 PM"],
  ["Tuesday", "7:00 AM - 7:00 PM"],
  ["Wednesday", "7:00 AM - 7:00 PM"],
  ["Thursday", "7:00 AM - 7:00 PM"],
  ["Friday", "7:00 AM - 7:00 PM"],
  ["Saturday", "8:00 AM - 8:00 PM"],
  ["Sunday", "8:00 AM - 6:00 PM"]
];

const PUBLIC_BUSINESSES = publicData.businesses as Business[];

const DEFAULT_DATABASE: AppDatabase = {
  categories: publicData.categories,
  neighborhoods: publicData.neighborhoods,
  businesses: PUBLIC_BUSINESSES,
  reviews: [],
  saves: [],
  reports: [],
  engagementEvents: [],
  ownerReviewReplies: [],
  reviewDirectThreads: [],
  users: [],
  businessClaims: [],
  notifications: []
};

const PUBLIC_REVIEWS = publicData.reviews as MobilePublicReview[];

function resolveCategory(business: Business) {
  return DEFAULT_DATABASE.categories.find((item) => item.id === business.categoryId);
}

function resolveNeighborhood(business: Business) {
  return DEFAULT_DATABASE.neighborhoods.find((item) => item.id === business.neighborhoodId);
}

function mapBusinessCard(business: Business, savedIds: string[]): MobileBusinessCard {
  const category = resolveCategory(business);
  const neighborhood = resolveNeighborhood(business);
  const isSaved = savedIds.includes(business.id);

  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    shortDescription: business.shortDescription,
    address: business.address,
    priceTier: business.priceTier,
    category: category?.name ?? "Unknown",
    neighborhood: neighborhood?.name ?? "Unknown",
    tags: Array.from(new Set([...(business.features ?? []), ...business.tags])),
    rating: business.rating,
    reviewCount: business.reviewCount,
    saveCount: business.saveCount + (isSaved ? 1 : 0),
    coverFrom: business.coverFrom,
    coverTo: business.coverTo,
    isSaved
  };
}

function buildMapUrl(business: Business) {
  if (business.googleMapsUrl) {
    return business.googleMapsUrl;
  }

  const query = encodeURIComponent(`${business.name}, ${business.address}, Addis Ababa, Ethiopia`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function getOpenToday(openingHours: [string, string][]) {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Africa/Addis_Ababa"
  }).format(new Date());

  return openingHours.find(([day]) => day === today)?.[1] ?? openingHours[0]?.[1] ?? "Hours not added";
}

function buildDefaultServices(business: Business) {
  const categorySlug = resolveCategory(business)?.slug ?? "";

  if (categorySlug === "cafes") {
    return [
      { name: "Macchiato", priceEtb: 25, description: "Classic Addis coffee energy in one short stop." },
      { name: "Buna", priceEtb: 20, description: "Traditional black coffee for everyday regulars." },
      { name: "Beans (250g)", priceEtb: 180, description: "Freshly roasted beans worth taking home." }
    ];
  }

  if (categorySlug === "restaurants") {
    return [
      { name: "Signature Plate", priceEtb: 320, description: "The dish most first-time guests start with." },
      { name: "Vegetarian Option", priceEtb: 240, description: "A reliable lighter meal for mixed groups." },
      { name: "Fresh Juice", priceEtb: 90, description: "A quick add-on that works at any hour." }
    ];
  }

  if (categorySlug === "bakeries") {
    return [
      { name: "Butter Croissant", priceEtb: 60, description: "A quick, warm staple for mornings." },
      { name: "Coffee Pairing", priceEtb: 35, description: "A simple match for a short stop." },
      { name: "Pastry Box", priceEtb: 240, description: "Best for office runs and group pickups." }
    ];
  }

  return [
    { name: "Signature Service", priceEtb: 180, description: "A dependable starting point for first-time visitors." },
    { name: "Local Favorite", priceEtb: 120, description: "Something regulars come back for." }
  ];
}

export function getCategoryCards() {
  return DEFAULT_DATABASE.categories
    .slice()
    .sort(
      (left, right) =>
        CATEGORY_ORDER.indexOf(left.slug as (typeof CATEGORY_ORDER)[number]) -
        CATEGORY_ORDER.indexOf(right.slug as (typeof CATEGORY_ORDER)[number])
    )
    .map((category) => ({
      ...category,
      emoji: CATEGORY_META[category.slug]?.emoji ?? "•",
      description: CATEGORY_META[category.slug]?.description ?? "A city-essential category"
    }));
}

export function getNeighborhoodOptions() {
  return DEFAULT_DATABASE.neighborhoods.slice().sort(
    (left, right) =>
      NEIGHBORHOOD_ORDER.indexOf(left.slug as (typeof NEIGHBORHOOD_ORDER)[number]) -
      NEIGHBORHOOD_ORDER.indexOf(right.slug as (typeof NEIGHBORHOOD_ORDER)[number])
  );
}

export function getHomeScreenData(savedIds: string[]) {
  const recommended = sortBusinesses(DEFAULT_DATABASE.businesses, "recommended");
  const topRated = sortBusinesses(DEFAULT_DATABASE.businesses, "top-rated");
  const pulseBusinesses = DEFAULT_DATABASE.businesses
    .slice()
    .sort(
      (left, right) =>
        right.reviewCount - left.reviewCount ||
        right.saveCount - left.saveCount ||
        right.viewCount - left.viewCount ||
        right.rating - left.rating
    )
    .slice(0, 4)
    .map((business) => mapBusinessCard(business, savedIds));

  const recentReviews = PUBLIC_REVIEWS.slice()
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .slice(0, 4)
    .map((review) => ({
      ...review,
      businessName:
        DEFAULT_DATABASE.businesses.find((business) => business.id === review.businessId)?.name ??
        "Addis favorite"
    }));

  return {
    heroBusiness: recommended[0] ? mapBusinessCard(recommended[0], savedIds) : null,
    featuredBusinesses: recommended.slice(0, 6).map((business) => mapBusinessCard(business, savedIds)),
    pulseBusinesses,
    topRatedBusinesses: topRated.slice(0, 4).map((business) => mapBusinessCard(business, savedIds)),
    recentReviews,
    categoryCards: getCategoryCards(),
    curatedFeatures: CURATED_HOME_FEATURES.map((feature) => ({
      value: feature,
      label: formatBusinessFeatureLabel(feature)
    })),
    stats: {
      businessCount: DEFAULT_DATABASE.businesses.length,
      reviewCount: PUBLIC_REVIEWS.length,
      neighborhoodCount: DEFAULT_DATABASE.neighborhoods.length
    }
  };
}

export function getExploreScreenData(filters: ExploreFilters, savedIds: string[]) {
  const sort = filters.sort ?? "recommended";
  const businesses = sortBusinesses(
    DEFAULT_DATABASE.businesses.filter((business) => {
      const category = resolveCategory(business);
      const neighborhood = resolveNeighborhood(business);

      return (
        matchesBusinessQuery(business, DEFAULT_DATABASE, filters.query) &&
        (!filters.category || category?.slug === filters.category) &&
        (!filters.neighborhood || neighborhood?.slug === filters.neighborhood)
      );
    }),
    sort
  ).map((business) => mapBusinessCard(business, savedIds));

  return {
    businesses,
    categories: getCategoryCards(),
    neighborhoods: getNeighborhoodOptions(),
    sort,
    sortOptions: [
      { value: "recommended" as const, label: "Recommended" },
      { value: "top-rated" as const, label: "Top Rated" },
      { value: "most-reviewed" as const, label: "Most Reviewed" },
      { value: "most-saved" as const, label: "Most Saved" }
    ]
  };
}

export function getSavedBusinesses(savedIds: string[]) {
  return DEFAULT_DATABASE.businesses
    .filter((business) => savedIds.includes(business.id))
    .sort((left, right) => right.rating - left.rating || right.saveCount - left.saveCount)
    .map((business) => mapBusinessCard(business, savedIds));
}

export function getBusinessDetailBySlug(slug: string, savedIds: string[]) {
  const business = DEFAULT_DATABASE.businesses.find((item) => item.slug === slug);

  if (!business) {
    return null;
  }

  const category = resolveCategory(business);
  const neighborhood = resolveNeighborhood(business);
  const openingHours =
    business.openingHours && business.openingHours.length
      ? (business.openingHours as [string, string][])
      : DEFAULT_OPENING_HOURS;
  const services =
    business.services && business.services.length
      ? business.services
      : buildDefaultServices(business);
  const reviews = PUBLIC_REVIEWS.filter((review) => review.businessId === business.id).sort((left, right) =>
    left.createdAt < right.createdAt ? 1 : -1
  );
  const relatedBusinesses = DEFAULT_DATABASE.businesses
    .filter((item) => item.id !== business.id && item.categoryId === business.categoryId)
    .slice(0, 3)
    .map((item) => mapBusinessCard(item, savedIds));

  return {
    business: mapBusinessCard(business, savedIds),
    detail: {
      heroImageUrl:
        business.bannerImageUrl ??
        CATEGORY_HERO_IMAGES[category?.slug ?? ""] ??
        CATEGORY_HERO_IMAGES.cafes,
      longDescription: business.longDescription,
      address: business.address,
      category: category?.name ?? "Unknown",
      categorySlug: category?.slug ?? "",
      neighborhood: neighborhood?.name ?? "Unknown",
      openToday: getOpenToday(openingHours),
      openingHours,
      services,
      tags: Array.from(new Set([...(business.features ?? []), ...business.tags])).map((tag) =>
        formatBusinessFeatureLabel(tag)
      ),
      mapUrl: buildMapUrl(business),
      priceLabel: formatPriceTierLabel(business.priceTier)
    },
    reviews,
    relatedBusinesses
  };
}

export function getProfileSnapshot(savedIds: string[], session: MobileSession | null) {
  return {
    savedCount: savedIds.length,
    publishedReviewCount: PUBLIC_REVIEWS.length,
    businessCount: DEFAULT_DATABASE.businesses.length,
    neighborhoodCount: DEFAULT_DATABASE.neighborhoods.length,
    activeMemberName: session?.displayName ?? "Guest"
  };
}

export function getPriceTierSummary(priceTier: string) {
  return PRICE_TIER_OPTIONS.find((option) => option.value === priceTier)?.label ?? priceTier;
}
