export type GameErrorCode =
  | "ROOM_NOT_FOUND"
  | "GAME_NOT_FOUND"
  | "ROOM_NOT_FULL"
  | "PLAYER_NOT_IN_ROOM"
  | "ROOM_FULL"
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "INVARIANT"
  | "INVALID_DECK"
  | "CONFLICT"
  | "RATE_LIMIT"
  | "INVALID_BET"
  | "INVALID_ACTION"
  | "INTERNAL";

export interface GameErrorOptions {
  code: GameErrorCode;
  message?: string; // Override default
  cause?: unknown;
  meta?: Record<string, unknown>;
  httpStatus?: number; // Optional override
}

const defaultMessages: Record<GameErrorCode, string> = {
  ROOM_NOT_FOUND: "Room not found",
  GAME_NOT_FOUND: "Game not found",
  ROOM_NOT_FULL: "Room is not full",
  PLAYER_NOT_IN_ROOM: "Player not in room",
  INVALID_DECK: "Invalid or exhausted deck",
  ROOM_FULL: "Room is full",
  UNAUTHORIZED: "Unauthorized",
  INVALID_BET: "Invalid bet",
  INVALID_ACTION: "Invalid action",
  VALIDATION: "Validation failed",
  INVARIANT: "Domain invariant violated",
  CONFLICT: "Conflict detected",
  RATE_LIMIT: "Too many requests",
  INTERNAL: "Internal server error",
};

const httpStatusMap: Partial<Record<GameErrorCode, number>> = {
  ROOM_NOT_FOUND: 404,
  GAME_NOT_FOUND: 404,
  PLAYER_NOT_IN_ROOM: 403,
  ROOM_FULL: 409,
  UNAUTHORIZED: 401,
  VALIDATION: 400,
  INVARIANT: 422,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  INTERNAL: 500,
};

export class GameError extends Error {
  public readonly code: GameErrorCode;
  public readonly httpStatus: number;
  public readonly meta?: Record<string, unknown>;
  public readonly cause?: unknown;

  constructor(options: GameErrorOptions) {
    const { code, message, cause, meta } = options;
    super(message || defaultMessages[code]);
    this.name = "GameError";
    this.code = code;
    this.meta = meta;
    this.cause = cause;
    this.httpStatus = options.httpStatus || httpStatusMap[code] || 500;
    Error.captureStackTrace?.(this, GameError);
  }

  toJSON() {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      ...(this.meta ? { meta: this.meta } : {}),
    };
  }
}

// Factory helpers for ergonomics
export const Errors = {
  roomNotFound(meta?: Record<string, unknown>) {
    return new GameError({ code: "ROOM_NOT_FOUND", meta });
  },
  gameNotFound(meta?: Record<string, unknown>) {
    return new GameError({ code: "GAME_NOT_FOUND", meta });
  },
  playerNotInRoom(meta?: Record<string, unknown>) {
    return new GameError({ code: "PLAYER_NOT_IN_ROOM", meta });
  },
  roomFull(meta?: Record<string, unknown>) {
    return new GameError({ code: "ROOM_FULL", meta });
  },
  unauthorized(meta?: Record<string, unknown>) {
    return new GameError({ code: "UNAUTHORIZED", meta });
  },
  validation(message?: string, meta?: Record<string, unknown>) {
    return new GameError({ code: "VALIDATION", message, meta });
  },
  invariant(message?: string, meta?: Record<string, unknown>) {
    return new GameError({ code: "INVARIANT", message, meta });
  },
  conflict(message?: string, meta?: Record<string, unknown>) {
    return new GameError({ code: "CONFLICT", message, meta });
  },
  rateLimit(meta?: Record<string, unknown>) {
    return new GameError({ code: "RATE_LIMIT", meta });
  },
  internal(cause?: unknown, meta?: Record<string, unknown>) {
    return new GameError({ code: "INTERNAL", cause, meta });
  },
};
