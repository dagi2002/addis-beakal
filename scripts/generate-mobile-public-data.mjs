import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const inputFile = path.join(projectRoot, "data", "app-db.json");
const outputFile = path.join(projectRoot, "data", "mobile-public.json");

const raw = JSON.parse(await readFile(inputFile, "utf8"));

const publicData = {
  categories: raw.categories ?? [],
  neighborhoods: raw.neighborhoods ?? [],
  businesses: (raw.businesses ?? []).map((business) => ({
    id: business.id,
    slug: business.slug,
    name: business.name,
    shortDescription: business.shortDescription,
    longDescription: business.longDescription,
    address: business.address,
    googleMapsUrl: business.googleMapsUrl,
    priceTier: business.priceTier,
    categoryId: business.categoryId,
    neighborhoodId: business.neighborhoodId,
    features: business.features ?? [],
    tags: business.tags ?? [],
    bannerImageUrl: business.bannerImageUrl,
    photoUrls: business.photoUrls ?? [],
    openingHours: business.openingHours ?? [],
    services: business.services ?? [],
    coverFrom: business.coverFrom,
    coverTo: business.coverTo,
    rating: business.rating,
    reviewCount: business.reviewCount,
    saveCount: business.saveCount,
    viewCount: business.viewCount,
    createdAt: business.createdAt
  })),
  reviews: (raw.reviews ?? [])
    .filter((review) => review.status === "published")
    .map((review) => ({
      id: review.id,
      businessId: review.businessId,
      authorName: review.authorName,
      rating: review.rating,
      title: review.title,
      body: review.body,
      tags: review.tags ?? [],
      visitDate: review.visitDate,
      createdAt: review.createdAt,
      photoUrls: review.photoUrls ?? []
    }))
};

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(publicData, null, 2)}\n`, "utf8");

console.log(`Wrote ${outputFile}`);
