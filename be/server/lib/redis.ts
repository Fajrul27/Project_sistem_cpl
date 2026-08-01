/**
 * Singleton Redis connection with automatic reconnect and failover safety.
 *
 * If Redis is not available on localhost:6379 or ioredis module is missing,
 * operations will safely return null/error without crashing the application,
 * allowing fallback to in-memory caching.
 */

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

let isRedisConnected = false;
let redisClient: any = null;

try {
  // Dynamic import pattern or safe require for production resilience
  const ioredis = await import('ioredis');
  const Redis = ioredis.default || ioredis.Redis;
  
  if (!Redis) throw new Error('Redis constructor not found in ioredis module');

  redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times: number) {
      if (times > 3) {
        console.warn('[Redis] Connection retries exhausted. Running in fallback mode.');
        return null;
      }
      return Math.min(times * 200, 2000);
    }
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log(`[Redis] Connected successfully to ${REDIS_HOST}:${REDIS_PORT}`);
  });

  redisClient.on('error', (err: any) => {
    if (isRedisConnected) {
      console.warn('[Redis] Connection warning:', err?.message || err);
    }
    isRedisConnected = false;
  });

  redisClient.connect().catch(() => {
    isRedisConnected = false;
    console.log('[Redis] Server not running locally. Using in-memory fallback cache.');
  });
} catch (e) {
  console.log('[Redis] Module ioredis not loaded or Redis unavailable. Using in-memory fallback cache.');
}

export const redis = redisClient;

export function getIsRedisConnected(): boolean {
  return isRedisConnected && redisClient && redisClient.status === 'ready';
}
