import { CACHE_TTL_1_DAY } from "@/contants/app_constants";
import redis from "./redis";

export function buildCacheKey(key, prefix = "") {
    return prefix ? `${prefix}:${key}` : key;
}

export async function getCache({ key, prefix = "", ttl = CACHE_TTL_1_DAY, fetchFn }) {
    const cacheKey = buildCacheKey(key, prefix);
    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const data = await fetchFn();
        await redis.set(cacheKey, JSON.stringify(data), { EX: ttl });
        return data;
    } catch (err) {
        console.error("Redis getCache error:", err);
        return await fetchFn();
    }
}

export async function setCache({ key, prefix = "", ttl = CACHE_TTL_1_DAY, data }) {
    const cacheKey = buildCacheKey(key, prefix);
    try {
        await redis.set(cacheKey, JSON.stringify(data), { EX: ttl });
    } catch (err) {
        console.error("Redis setCache error:", err);
    }
}

export async function delCache({ key, prefix = "" }) {
    const cacheKey = buildCacheKey(key, prefix);
    try {
        await redis.del(cacheKey);
    } catch (err) {
        console.error("Redis delCache error:", err);
    }
}

export async function delAllWithPrefix(prefix) {
    const keys = await redis.keys(`${prefix}:*`);
    if (keys.length > 0) {
        await redis.del(keys);
    }
}
