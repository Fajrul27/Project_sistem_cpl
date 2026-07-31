/**
 * Server-side Hybrid Cache (Redis + In-Memory Fallback) for Dashboard Stats & Aggregates.
 *
 * Design Strategy for Skripsi Thesis:
 * 1. Redis Caching: Shared across all PM2 cluster worker processes so cache pre-warming
 *    on worker 1 immediately benefits worker 2...24.
 * 2. In-Memory Fallback: Fast Map cache used if Redis server is offline or unreachable.
 * 3. Monotonic Global Versioning: Bumped on data mutation to invalidate stale entries.
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
export async function getGlobalVersionAsync(): Promise<number> {
    if (getIsRedisConnected() && redis) {
        try {
            const v = await redis.get('cpl_cache_version');
            if (v) return parseInt(v, 10);
        } catch (err) {}
    }
    return globalVersion;
}

export async function invalidateDashboardCacheAsync(): Promise<void> {
    globalVersion++;
    inMemoryStore.clear();

    if (getIsRedisConnected() && redis) {
        try {
            await redis.incr('cpl_cache_version');
            await redis.flushdb();
        } catch (err) {
            const keys = await redis.keys('cpl_cache:*');
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        }
    }
}

export function invalidateDashboardCache(): void {
    globalVersion++;
    inMemoryStore.clear();

    if (getIsRedisConnected() && redis) {
        redis.incr('cpl_cache_version').catch(() => {});
        redis.flushdb().catch(() => {
            redis.keys('cpl_cache:*').then((keys: string[]) => {
                if (keys.length > 0) redis.del(...keys);
            }).catch(() => {});
        });
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
