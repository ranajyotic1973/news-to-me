import { NewspaperPage } from './StoryFormattingService';

interface CacheKey {
  childAge: number;
  childCountry: string;
}

interface CacheEntry {
  pages: Map<number, NewspaperPage>;
  lastAccess: number;
  totalPagesGenerated: number;
}

export class NewspaperCacheService {
  private static cache: Map<string, CacheEntry> = new Map();
  private static readonly MAX_PAGES_PER_SESSION = 100;
  private static readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  private static getKey(childAge: number, childCountry: string): string {
    return `${childAge}:${childCountry}`;
  }

  static getCachedPage(childAge: number, childCountry: string, pageNum: number): NewspaperPage | null {
    const key = this.getKey(childAge, childCountry);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache is stale
    const ageMs = Date.now() - entry.lastAccess;
    if (ageMs > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    // Update last access time
    entry.lastAccess = Date.now();

    // Return page if cached
    const page = entry.pages.get(pageNum);
    return page || null;
  }

  static cachePage(childAge: number, childCountry: string, page: NewspaperPage): void {
    const key = this.getKey(childAge, childCountry);
    let entry = this.cache.get(key);

    if (!entry) {
      entry = {
        pages: new Map(),
        lastAccess: Date.now(),
        totalPagesGenerated: 0,
      };
      this.cache.set(key, entry);
    }

    entry.pages.set(page.pageNumber, page);
    entry.lastAccess = Date.now();
    entry.totalPagesGenerated = Math.max(entry.totalPagesGenerated, page.pageNumber);
  }

  static clearCache(childAge?: number, childCountry?: string): void {
    if (childAge !== undefined && childCountry !== undefined) {
      const key = this.getKey(childAge, childCountry);
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  static getLastGeneratedPageNum(childAge: number, childCountry: string): number {
    const key = this.getKey(childAge, childCountry);
    const entry = this.cache.get(key);
    return entry ? entry.totalPagesGenerated : 0;
  }

  static isPageCached(childAge: number, childCountry: string, pageNum: number): boolean {
    return this.getCachedPage(childAge, childCountry, pageNum) !== null;
  }
}
