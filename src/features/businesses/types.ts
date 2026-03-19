export type ReviewStatus = "published" | "pending" | "rejected" | "removed";
export type ReportStatus = "open" | "triaged" | "resolved";
export type ClaimStatus = "pending" | "approved" | "rejected" | "superseded";
export type UserRole = "member" | "admin";

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
  priceTier: "$" | "$$" | "$$$" | "$$$$";
  categoryId: string;
  neighborhoodId: string;
  tags: string[];
  coverFrom: string;
  coverTo: string;
  rating: number;
  reviewCount: number;
  saveCount: number;
  ownerUserId?: string;
  claimedAt?: string;
};

export type Review = {
  id: string;
  businessId: string;
  authorId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  visitDate: string;
  createdAt: string;
  updatedAt: string;
  status: ReviewStatus;
  reportCount: number;
  photoUrls: string[];
};

export type Save = {
  id: string;
  businessId: string;
  userId: string;
  createdAt: string;
};

export type Report = {
  id: string;
  businessId: string;
  reviewId?: string;
  userId: string;
  reason: string;
  details: string;
  contactEmail?: string;
  createdAt: string;
  status: ReportStatus;
};

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type BusinessClaim = {
  id: string;
  businessId: string;
  userId: string;
  claimantName: string;
  claimantEmail: string;
  relationship: string;
  proofText: string;
  status: ClaimStatus;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
};

export type AppDatabase = {
  categories: Category[];
  neighborhoods: Neighborhood[];
  businesses: Business[];
  reviews: Review[];
  saves: Save[];
  reports: Report[];
  users: User[];
  businessClaims: BusinessClaim[];
};

export type DiscoverSort = "recommended" | "top-rated" | "most-reviewed" | "most-saved";

export type DiscoverFilters = {
  query?: string;
  category?: string;
  neighborhood?: string;
  minRating?: number;
  priceTiers?: string[];
  features?: string[];
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
  ownerName?: string;
};
