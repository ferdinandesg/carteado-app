import type { Logger } from "pino";
import { AuthenticatedUser } from "shared/types/guest";
import { Socket, Namespace } from "socket.io";

declare module "socket.io" {
  interface Socket {
    user: AuthenticatedUser;
    /** Child logger com userId/role/userName (definido no AuthSocket). */
    log: Logger;
  }
}

export interface SocketContext<T = unknown> {
  socket: Socket;
  payload: T;
  channel: Namespace;
}
