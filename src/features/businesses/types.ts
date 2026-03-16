export type ReviewStatus = "published" | "pending" | "rejected" | "removed";
export type ReportStatus = "open" | "triaged" | "resolved";

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Neighborhood = {
  id: string;
  name: string;
  slug: string;
};

export type Business = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  address: string;
  priceTier: "$" | "$$" | "$$$";
  categoryId: string;
  neighborhoodId: string;
  tags: string[];
  coverFrom: string;
  coverTo: string;
  rating: number;
  reviewCount: number;
  saveCount: number;
};

export type Review = {
  id: string;
  businessId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  visitDate: string;
  createdAt: string;
  status: ReviewStatus;
  reportCount: number;
};

export type Save = {
  id: string;
  businessId: string;
  viewerId: string;
  createdAt: string;
};

export type Report = {
  id: string;
  businessId: string;
  reviewId?: string;
  viewerId: string;
  reason: string;
  details: string;
  contactEmail?: string;
  createdAt: string;
  status: ReportStatus;
};

export type AppDatabase = {
  categories: Category[];
  neighborhoods: Neighborhood[];
  businesses: Business[];
  reviews: Review[];
  saves: Save[];
  reports: Report[];
};

export type DiscoverSort = "recommended" | "top-rated" | "most-reviewed" | "most-saved";

export type DiscoverFilters = {
  query?: string;
  category?: string;
  neighborhood?: string;
  sort?: DiscoverSort;
};

export type BusinessCardData = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  address: string;
  priceTier: Business["priceTier"];
  category: string;
  neighborhood: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  saveCount: number;
  coverFrom: string;
  coverTo: string;
  isSaved: boolean;
};

