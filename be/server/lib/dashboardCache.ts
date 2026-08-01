/**
 * Server-side Hybrid Cache (Redis + In-Memory Fallback) for Dashboard Stats & Aggregates.
 *
 * Design Strategy for Skripsi Thesis:
 * 1. Redis Caching: Shared across all PM2 cluster worker processes so cache pre-warming
 *    on worker 1 immediately benefits worker 2...24.
 * 2. In-Memory Fallback: Fast Map cache used if Redis server is offline or unreachable.
 * 3. Monotonic Global Versioning: Bumped on data mutation to invalidate stale entries.
 *
 * OPTIMIZATIONS:
 * - localVersionCache: Caches Redis version locally for 2 seconds to avoid redis.get()
 *   on every single getCacheAsync/setCacheAsync call (was causing 2x Redis round-trips per op).
 * - invalidateDashboardCache no longer uses redis.keys() O(N) full scan.
 *   It only bumps the version counter; stale entries expire naturally via TTL.
 */

import { redis, getIsRedisConnected } from './redis.js';

interface CacheEntry {
    data: any;
    expiresAt: number;
    /** Monotonic version counter; bumped on every invalidation */
    version: number;
}

const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours (1 day)
const CACHE_TTL_MS = CACHE_TTL_SECONDS * 1000;

// Global version counter – when bumped, all entries are considered stale
let globalVersion = 0;

/**
 * Local version cache to avoid a Redis round-trip on EVERY cache read/write.
 * Refreshed from Redis at most once every VERSION_CACHE_TTL_MS milliseconds.
 * This eliminates the N×redis.get('cpl_cache_version') pattern.
 */
let localVersionCache = { value: 0, fetchedAt: 0 };
const VERSION_CACHE_TTL_MS = 2000; // 2 seconds – stale window acceptable for dashboard

const inMemoryStore = new Map<string, CacheEntry>();

/**
 * Build a deterministic cache key.
 */
export function buildCacheKey(userId: string, role: string, filters: Record<string, any>): string {
    const sortedFilters = Object.keys(filters || {})
        .sort()
        .map(k => `${k}=${filters[k] ?? ''}`)
        .join('&');
    return `cpl_cache:${userId}:${role}:${sortedFilters}`;
}

/**
 * Get cached data asynchronously (Checks Redis first, falls back to In-Memory).
 */
export async function getCacheAsync(key: string): Promise<any | null> {
    const currentVersion = await getGlobalVersionAsync();

    // 1. Try Redis if connected
    if (getIsRedisConnected()) {
        try {
            const raw = await redis.get(key);
            if (raw) {
                const parsed: CacheEntry = JSON.parse(raw);
                if (parsed.version === currentVersion) {
                    return parsed.data;
                }
                // Stale version in Redis
                await redis.del(key).catch(() => {});
            }
        } catch (err) {
            // Fall through to in-memory store
        }
    }

    // 2. In-Memory fallback
    const entry = inMemoryStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt || entry.version !== currentVersion) {
        inMemoryStore.delete(key);
        return null;
    }
    return entry.data;
}

/**
 * Synchronous getCache for backward compatibility with synchronous callers.
 */
export function getCache(key: string): any | null {
    const entry = inMemoryStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt || entry.version !== globalVersion) {
        inMemoryStore.delete(key);
        return null;
    }
    return entry.data;
}

/**
 * Store data in cache (Both Redis and In-Memory).
 */
export async function setCacheAsync(key: string, data: any): Promise<void> {
    const currentVersion = await getGlobalVersionAsync();
    const entry: CacheEntry = {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
        version: currentVersion,
    };

    // 1. Save to In-Memory store
    inMemoryStore.set(key, entry);

    // 2. Save to Redis if connected
    if (getIsRedisConnected()) {
        try {
            await redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(entry));
        } catch (err) {
            // Non-critical
        }
    }
}

/**
 * Synchronous setCache for backward compatibility.
 */
export function setCache(key: string, data: any): void {
    const entry: CacheEntry = {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
        version: globalVersion,
    };
    inMemoryStore.set(key, entry);

    if (getIsRedisConnected()) {
        redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(entry)).catch(() => {});
    }
}

/**
 * Invalidate ALL dashboard cache entries.
 * Bumps global version and clears stored entries.
 */
/**
 * Get the global cache version.
 * Uses a local in-process cache (2-second TTL) to avoid a Redis round-trip
 * on every getCacheAsync / setCacheAsync call.
 */
export async function getGlobalVersionAsync(): Promise<number> {
    // Serve from local cache if still fresh
    if (Date.now() - localVersionCache.fetchedAt < VERSION_CACHE_TTL_MS) {
        return localVersionCache.value;
    }

    if (getIsRedisConnected() && redis) {
        try {
            const v = await redis.get('cpl_cache_version');
            const version = v ? parseInt(v, 10) : globalVersion;
            localVersionCache = { value: version, fetchedAt: Date.now() };
            return version;
        } catch (err) {}
    }

    // Fallback to in-process counter
    localVersionCache = { value: globalVersion, fetchedAt: Date.now() };
    return globalVersion;
}

/**
 * Async invalidation: bumps version counter only.
 * Old Redis keys with a stale version are ignored on next read and expire naturally via TTL.
 * REMOVED: redis.keys() O(N) full scan — was the main cause of Redis CPU spikes.
 */
export async function invalidateDashboardCacheAsync(): Promise<void> {
    globalVersion++;
    localVersionCache = { value: globalVersion, fetchedAt: Date.now() };
    inMemoryStore.clear();

    if (getIsRedisConnected() && redis) {
        try {
            const newVersion = await redis.incr('cpl_cache_version');
            // Sync local cache with the authoritative Redis value
            localVersionCache = { value: newVersion, fetchedAt: Date.now() };
        } catch (err) {
            console.error('[Cache] Error bumping cache version in Redis:', err);
        }
    }
}

/**
 * Sync invalidation: bumps version counter only.
 * REMOVED: redis.keys() O(N) full scan — was the main cause of Redis CPU spikes.
 */
export function invalidateDashboardCache(): void {
    globalVersion++;
    localVersionCache = { value: globalVersion, fetchedAt: Date.now() };
    inMemoryStore.clear();

    if (getIsRedisConnected() && redis) {
        // Only bump the version — do NOT use redis.keys() which is O(N) and blocks Redis
        redis.incr('cpl_cache_version').then((newVersion: number) => {
            localVersionCache = { value: newVersion, fetchedAt: Date.now() };
        }).catch(() => {});
    }
}

/**
 * Return cache stats for health monitoring.
 */
export function getCacheStats() {
    return {
        inMemorySize: inMemoryStore.size,
        globalVersion,
        redisConnected: getIsRedisConnected(),
    };
}
