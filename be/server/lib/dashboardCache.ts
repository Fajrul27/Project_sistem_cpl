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

// TTL diubah menjadi 24 jam untuk mendukung Event-Driven Cache Invalidation (otomatis reset saat ada data baru)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Global version counter – when bumped, all entries are considered stale
let globalVersion = 0;

const store = new Map<string, CacheEntry>();
const inFlightPromises = new Map<string, Promise<any>>();

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
 * Get cached data or execute fetcher with In-Flight Promise Coalescing.
 * When multiple concurrent requests hit a Cold Cache for the same key,
 * only the first request executes `fetcher()`. Subsequent requests await the exact same promise.
 */
export async function getOrSetCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // 1. Check Warm Cache
    const cached = getCache(key);
    if (cached !== null) {
        return cached;
    }

    // 2. Check if a fetch is already in-flight for this key (Promise Coalescing / Deduplication)
    if (inFlightPromises.has(key)) {
        return inFlightPromises.get(key) as Promise<T>;
    }

    // 3. Create new fetch task and store promise in inFlightPromises
    const promise = (async () => {
        try {
            const data = await fetcher();
            setCache(key, data);
            return data;
        } finally {
            inFlightPromises.delete(key);
        }
    })();

    inFlightPromises.set(key, promise);
    return promise;
}

/**
 * Invalidate ALL dashboard cache entries.
 * Call this whenever data that affects dashboard aggregates changes.
 */
export function invalidateDashboardCache(): void {
    globalVersion++;
    // Also clear expired entries to keep memory lean
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
        inFlightCount: inFlightPromises.size,
        globalVersion,
    };
}
