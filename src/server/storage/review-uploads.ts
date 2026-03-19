import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "reviews");
const MAX_FILES = 4;
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);

export async function storeReviewUploads(files: File[]) {
  if (files.length === 0) {
    return [];
  }

  if (files.length > MAX_FILES) {
    throw new Error("You can upload up to 4 review photos.");
  }

  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const extension = ALLOWED_TYPES.get(file.type);

    if (!extension) {
      throw new Error("Only JPG, PNG, and WEBP review images are supported.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Each review image must be 4MB or smaller.");
    }

    const fileName = `${crypto.randomUUID()}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIRECTORY, fileName), buffer);
    uploadedUrls.push(`/uploads/reviews/${fileName}`);
  }

  return uploadedUrls;
}
