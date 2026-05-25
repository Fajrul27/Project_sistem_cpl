/**
 * Server-side in-memory cache for Dashboard Stats.
 *
 * Strategy:
 * - Cache keyed by: `userId:role:filterHash`
 * - TTL: 5 minutes (stale after that, will re-fetch)
 * - Invalidation: Call `invalidateDashboardCache()` from any controller
 *   that mutates core data (nilaiCpl, cpl, mataKuliah, cpmk, etc.)
 */

interface CacheEntry {
    data: any;
    expiresAt: number;
    /** Monotonic version counter; bumped on every invalidation */
    version: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Global version counter – when bumped, all entries are considered stale
let globalVersion = 0;

const store = new Map<string, CacheEntry>();

/**
 * Build a deterministic cache key.
 */
export function buildCacheKey(userId: string, role: string, filters: Record<string, any>): string {
    const sortedFilters = Object.keys(filters)
        .sort()
        .map(k => `${k}=${filters[k] ?? ''}`)
        .join('&');
    return `${userId}:${role}:${sortedFilters}`;
}

/**
 * Get cached data. Returns null if missing, expired, or stale version.
 */
export function getCache(key: string): any | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    if (entry.version !== globalVersion) {
        store.delete(key);
        return null;
    }
    return entry.data;
}

/**
 * Store data in cache.
 */
export function setCache(key: string, data: any): void {
    store.set(key, {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
        version: globalVersion,
    });
}

/**
 * Invalidate ALL dashboard cache entries.
 * Call this whenever data that affects dashboard aggregates changes.
 */
export function invalidateDashboardCache(): void {
    globalVersion++;
    // Also clear expired entries to keep memory lean
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (Date.now() > entry.expiresAt || entry.version !== globalVersion) {
            store.delete(key);
        }
    }
}

/**
 * Return cache stats (useful for debugging).
 */
export function getCacheStats() {
    return {
        size: store.size,
        globalVersion,
    };
}
