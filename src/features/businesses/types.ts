export type ReviewStatus = "published" | "pending" | "rejected" | "removed";
export type ReportStatus = "open" | "resolved" | "dismissed";
export type ClaimStatus = "pending" | "approved" | "rejected" | "superseded";
export type UserRole = "member" | "admin";
export type BusinessEngagementEventType = "page_view" | "map_view" | "directions_click";
export type ReportTargetType = "business" | "review" | "owner_reply" | "direct_message";
export type NotificationKind =
  | "admin_broadcast"
  | "claim_submitted"
  | "claim_reviewed"
  | "ownership_assigned"
  | "direct_thread_message"
  | "owner_reply_received"
  | "admin_role_updated"
  | "review_received"
  | "moderation_update";
export type NotificationStatus = "unread" | "read";
export type ReportResolution =
  | "dismissed"
  | "content_removed"
  | "content_restored"
  | "thread_closed"
  | "owner_messaging_suspended";
export type OwnerReplyStatus = "active" | "removed";
export type ReviewDirectThreadStatus = "open" | "closed" | "removed";
export type DirectMessageStatus = "active" | "removed";
export type DirectMessageSenderRole = "owner" | "reviewer";

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
  googleMapsUrl?: string;
  priceTier: "$" | "$$" | "$$$" | "$$$$";
  categoryId: string;
  neighborhoodId: string;
  features?: string[];
  tags: string[];
  bannerImageUrl?: string;
  photoUrls?: string[];
  openingHours?: [string, string][];
  services?: Array<{ name: string; priceEtb: number; description: string }>;
  coverFrom: string;
  coverTo: string;
  rating: number;
  reviewCount: number;
  saveCount: number;
  viewCount: number;
  createdAt?: string;
  createdByUserId?: string;
  ownerUserId?: string;
  claimedAt?: string;
  ownerMessagingDisabledAt?: string;
  ownerMessagingDisabledReason?: string;
};

export type Review = {
  id: string;
  businessId: string;
  authorId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  tags: string[];
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
  userId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details: string;
  contactEmail?: string;
  createdAt: string;
  status: ReportStatus;
  resolution?: ReportResolution;
  resolvedAt?: string;
  resolvedByUserId?: string;
  resolutionNote?: string;
};

export type BusinessEngagementEvent = {
  id: string;
  businessId: string;
  reviewId?: string;
  userId?: string;
  sessionKey: string;
  type: BusinessEngagementEventType;
  createdAt: string;
};

export type OwnerReviewReply = {
  id: string;
  businessId: string;
  reviewId: string;
  ownerUserId: string;
  body: string;
  status: OwnerReplyStatus;
  createdAt: string;
  updatedAt: string;
};

export type ReviewDirectMessage = {
  id: string;
  senderUserId: string;
  senderRole: DirectMessageSenderRole;
  body: string;
  status: DirectMessageStatus;
  createdAt: string;
};

export type ReviewDirectThread = {
  id: string;
  businessId: string;
  reviewId: string;
  ownerUserId: string;
  reviewAuthorId: string;
  status: ReviewDirectThreadStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: ReviewDirectMessage[];
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
  claimantPhone?: string;
  relationship?: string;
  proofText: string;
  proofFileUrls: string[];
  status: ClaimStatus;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
};

export type UserNotification = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
  actionHref?: string;
  actionLabel?: string;
  senderUserId?: string;
};

export type AppDatabase = {
  categories: Category[];
  neighborhoods: Neighborhood[];
  businesses: Business[];
  reviews: Review[];
  saves: Save[];
  reports: Report[];
  engagementEvents: BusinessEngagementEvent[];
  ownerReviewReplies: OwnerReviewReply[];
  reviewDirectThreads: ReviewDirectThread[];
  users: User[];
  businessClaims: BusinessClaim[];
  notifications: UserNotification[];
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
