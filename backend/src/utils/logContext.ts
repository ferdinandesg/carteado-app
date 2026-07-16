import type { Logger } from "pino";
import type { AuthenticatedUser } from "shared/types";
import { logger } from "@/utils/logger";

/** Campos estáveis para filtro no GCS Logs Explorer (`jsonPayload.userId`, etc.). */
export type UserLogBindings = {
  userId: string;
  role: AuthenticatedUser["role"];
  userName: string;
};

export function userLogBindings(
  user: Pick<AuthenticatedUser, "id" | "role" | "name">
): UserLogBindings {
  return {
    userId: user.id,
    role: user.role,
    userName: user.name,
  };
}

export function withUser(
  parent: Logger,
  user: Pick<AuthenticatedUser, "id" | "role" | "name">
): Logger {
  return parent.child(userLogBindings(user));
}

/** Logger do request (pino-http) ou fallback global. */
export function reqLogger(req: { log?: Logger }): Logger {
  return req.log ?? logger;
}

/** Logger do socket (AuthSocket) ou fallback global. */
export function socketLogger(socket: { log?: Logger }): Logger {
  return socket.log ?? logger;
}
