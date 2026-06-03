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

/** 30 dias — alinhado com expiração do access token / sessão NextAuth. */
const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60;

export const REDIS_TTL = {
  room: 7200, // 2h
  game: 7200,
  chat: 7200,
  session: 7200, // 2h — janela de reconexão de sala
  guest: THIRTY_DAYS_SEC,
} as const;
