import { redis } from "./redis";

async function testRedisConnection() {
  try {
    // Test basic connection
    const ping = await redis.ping();
    console.log("Redis PING response:", ping);

    // Test setting and getting a value
    await redis.set("test_key", "Hello Redis!");
    const value = await redis.get("test_key");
    console.log("Test value retrieved:", value);

    // Clean up test key
    await redis.del("test_key");

    console.log("Redis connection test successful!");
  } catch (error) {
    console.error("Redis connection test failed:", error);
  } finally {
    // Close the connection
    await redis.quit();
  }
}

testRedisConnection();
