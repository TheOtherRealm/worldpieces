"""World Pieces — Redis / RedisJSON connection and helpers.

Connects to the existing Redis server at 10.0.0.90:6379 using the
redis_password environment variable as specified.
"""
import json
from typing import Any, Optional
import redis.asyncio as aioredis
from app.config import get_settings

_redis: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        settings = get_settings()
        _redis = aioredis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            username=settings.redis_username,
            password=settings.redis_password,
            decode_responses=True,
        )
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None


# ── RedisJSON helpers ──────────────────────────────────────────────────────────

async def json_set(key: str, path: str, value: Any) -> None:
    r = await get_redis()
    await r.execute_command("JSON.SET", key, path, json.dumps(value))


async def json_get(key: str, path: str = ".") -> Optional[Any]:
    r = await get_redis()
    raw = await r.execute_command("JSON.GET", key, path)
    if raw is None:
        return None
    if isinstance(raw, (dict, list)):
        return raw
    return json.loads(raw)


async def json_del(key: str, path: str = ".") -> int:
    r = await get_redis()
    return await r.execute_command("JSON.DEL", key, path)  # type: ignore


async def json_mget(keys: list[str], path: str = ".") -> list[Optional[Any]]:
    if not keys:
        return []
    r = await get_redis()
    raws = await r.execute_command("JSON.MGET", *keys, path)
    return [json.loads(item) if item else None for item in raws]  # type: ignore


async def keys_matching(pattern: str) -> list[str]:
    r = await get_redis()
    return await r.keys(pattern)  # type: ignore


async def set_with_expiry(key: str, value: str, seconds: int) -> None:
    r = await get_redis()
    await r.setex(key, seconds, value)


async def get_value(key: str) -> Optional[str]:
    r = await get_redis()
    return await r.get(key)  # type: ignore


async def delete_key(key: str) -> int:
    r = await get_redis()
    return await r.delete(key)  # type: ignore


async def sadd(key: str, *members: str) -> int:
    r = await get_redis()
    return await r.sadd(key, *members)  # type: ignore


async def smembers(key: str) -> set:
    r = await get_redis()
    return await r.smembers(key)  # type: ignore


async def srem(key: str, *members: str) -> int:
    r = await get_redis()
    return await r.srem(key, *members)  # type: ignore


async def lpush(key: str, *values: str) -> int:
    r = await get_redis()
    return await r.lpush(key, *values)  # type: ignore


async def lrange(key: str, start: int, end: int) -> list[str]:
    r = await get_redis()
    return await r.lrange(key, start, end)  # type: ignore


async def zadd(key: str, mapping: dict) -> int:
    r = await get_redis()
    return await r.zadd(key, mapping)  # type: ignore


async def zrange(key: str, start: int, end: int, desc: bool = False) -> list[str]:
    r = await get_redis()
    return await r.zrange(key, start, end, desc=desc)  # type: ignore


async def zrem(key: str, *members: str) -> int:
    r = await get_redis()
    return await r.zrem(key, *members)  # type: ignore
