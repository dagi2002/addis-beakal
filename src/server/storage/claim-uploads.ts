import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "claims");
const MAX_FILES = 1;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);

export async function storeClaimUploads(files: File[]) {
  if (files.length === 0) {
    return [];
  }

  if (files.length > MAX_FILES) {
    throw new Error("Upload one proof document at a time.");
  }

  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const extension = ALLOWED_TYPES.get(file.type);

    if (!extension) {
      throw new Error("Only PDF, JPG, PNG, and WEBP proof files are supported.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Each proof file must be 8MB or smaller.");
    }

    const fileName = `${crypto.randomUUID()}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIRECTORY, fileName), buffer);
    uploadedUrls.push(`/uploads/claims/${fileName}`);
  }

  return uploadedUrls;
}
