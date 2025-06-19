import IORedis from "ioredis";

export const redis = new IORedis({
  host: process.env.REDIS_HOST || "localhost", // Changed from IP to localhost
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
  connectTimeout: 10000,
  lazyConnect: true,
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});
