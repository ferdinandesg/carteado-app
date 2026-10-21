/** Redis key builders and TTLs */
import { SESSION_TTL_SEC } from "shared/types";

export const REDIS_KEY_PREFIX = {
  room: "room:",
  game: "game:",
  chat: "chat:",
  guest: "guest:",
} as const;

export const REDIS_KEYS = {
  room: (hash: string) => `room:${hash}`,
  game: (hash: string) => `game:${hash}`,
  chat: (hash: string) => `chat:${hash}`,
  guest: (id: string) => `guest:${id}`,
} as const;

export const REDIS_TTL = {
  room: 7200, // 2h
  game: 7200,
  chat: 7200,
  guest: SESSION_TTL_SEC,
} as const;
