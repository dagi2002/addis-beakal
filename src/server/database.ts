import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildSeedDatabase } from "@/features/businesses/seed";
import type { AppDatabase } from "@/features/businesses/types";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "app-db.json");

async function ensureDatabaseFile() {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await readFile(DATA_FILE, "utf-8");
  } catch {
    await writeDatabase(buildSeedDatabase());
  }
}

export async function readDatabase() {
  await ensureDatabaseFile();
  const raw = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as AppDatabase;
}

export async function writeDatabase(database: AppDatabase) {
  await mkdir(DATA_DIRECTORY, { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  await writeFile(tempFile, JSON.stringify(database, null, 2), "utf-8");
  await rename(tempFile, DATA_FILE);
}

export async function updateDatabase(
  updater: (database: AppDatabase) => AppDatabase | Promise<AppDatabase>
) {
  const current = await readDatabase();
  const next = await updater(current);
  await writeDatabase(next);
  return next;
}
