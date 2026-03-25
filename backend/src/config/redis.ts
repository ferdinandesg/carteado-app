/** Redis key builders and TTLs */

export const REDIS_KEY_PREFIX = {
  room: "room:",
  game: "game:",
  chat: "chat:",
  session: "session:",
  guest: "guest:",
} as const;

export const REDIS_KEYS = {
  room: (hash: string) => `room:${hash}`,
  game: (hash: string) => `game:${hash}`,
  chat: (hash: string) => `chat:${hash}`,
  session: (userId: string) => `session:${userId}`,
  guest: (id: string) => `guest:${id}`,
} as const;

export const REDIS_TTL = {
  room: 7200, // 2h
  game: 7200,
  chat: 7200,
  session: 300, // 5min for reconnection
  guest: 7200, // 2h
} as const;
