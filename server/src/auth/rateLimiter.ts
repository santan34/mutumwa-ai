import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "../config/redis";

export const tokenGenerationLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "token_limit",
  points: 5, // Number of tokens allowed
  duration: 60, // Per minute
  blockDuration: 300, // Block for 5 minutes if exceeded
});
