export const BUSINESS_FEATURE_OPTIONS = [
  "best buna",
  "fasting-friendly",
  "trending now",
  "strong wifi",
  "date spots",
  "family-friendly",
  "live music",
  "open late",
  "great coffee",
  "fasting friendly",
  "halal",
  "rooftop",
  "parking",
  "delivery",
  "outdoor seating",
  "family friendly",
  "affordable",
  "quick service",
  "walk-in friendly",
  "appointments",
  "healthcare",
  "wellness",
  "fresh baked",
  "nightlife",
  "date spot",
  "community",
  "maintenance",
  "diagnostics",
  "beauty",
  "relaxation",
  "coworking friendly",
  "group friendly",
  "event friendly",
  "kid friendly",
  "late night",
  "takeaway"
] as const;

export const CURATED_HOME_FEATURES = [
  "best buna",
  "fasting-friendly",
  "trending now",
  "strong wifi",
  "date spots",
  "family-friendly",
  "live music",
  "open late"
] as const;

export const PRICE_TIER_OPTIONS = [
  { value: "$", shortLabel: "$", label: "Budget · up to 1,000 ETB" },
  { value: "$$", shortLabel: "$$", label: "Mid-range · 1,000-2,500 ETB" },
  { value: "$$$", shortLabel: "$$$", label: "Premium · 2,500-5,000 ETB" },
  { value: "$$$$", shortLabel: "$$$$", label: "Luxury · 5,000-7,000+ ETB" }
] as const;

const FEATURE_LABELS: Record<string, string> = {
  "best buna": "Best Buna",
  "fasting-friendly": "Fasting-Friendly",
  "trending now": "Trending Now",
  "strong wifi": "Strong WiFi",
  "date spots": "Date Spots",
  "family-friendly": "Family-Friendly",
  "live music": "Live Music",
  "open late": "Open Late",
  "great coffee": "Great Coffee",
  "fasting friendly": "Fasting Friendly",
  halal: "Halal",
  rooftop: "Rooftop",
  parking: "Parking",
  delivery: "Delivery",
  "outdoor seating": "Outdoor Seating",
  "family friendly": "Family Friendly",
  affordable: "Affordable",
  "quick service": "Quick Service",
  "walk-in friendly": "Walk-In Friendly",
  appointments: "Appointments",
  healthcare: "Healthcare",
  wellness: "Wellness",
  "fresh baked": "Fresh Baked",
  nightlife: "Nightlife",
  "date spot": "Date Spot",
  community: "Community",
  maintenance: "Maintenance",
  diagnostics: "Diagnostics",
  beauty: "Beauty",
  relaxation: "Relaxation",
  "coworking friendly": "Coworking Friendly",
  "group friendly": "Group Friendly",
  "event friendly": "Event Friendly",
  "kid friendly": "Kid Friendly",
  "late night": "Late Night",
  takeaway: "Takeaway"
};

export function formatBusinessFeatureLabel(feature: string) {
  return FEATURE_LABELS[feature] ?? feature.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPriceTierLabel(priceTier: string) {
  return PRICE_TIER_OPTIONS.find((option) => option.value === priceTier)?.label ?? priceTier;
}

export const BUSINESS_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
] as const;
