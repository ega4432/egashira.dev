import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

export interface LinkCardData {
  title: string;
  description: string;
  faviconSrc: string;
  ogImageSrc: string;
  displayUrl: string;
  url: string;
}

interface OgCacheEntry {
  timestamp: number;
  data: LinkCardData;
}

const CACHE_PATH = resolve(process.cwd(), "public", "og-cache.json");

let cache: Record<string, OgCacheEntry> = {};

export const getOgData = async (url: string): Promise<LinkCardData | null> => {
  if (Object.keys(cache).length === 0) {
    try {
      const json = await readFile(CACHE_PATH, "utf-8");
      cache = JSON.parse(json);
    } catch {
      cache = {};
    }
  }
  const entry = cache[url];
  return entry ? entry.data : null;
};

export const setOgData = async (
  url: string,
  data: LinkCardData
): Promise<void> => {
  cache[url] = { timestamp: Date.now(), data };
  try {
    const cacheDir = resolve(process.cwd(), "public");
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error("Failed to save cache", error);
  }
};
