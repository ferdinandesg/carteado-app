import { AuthenticatedUser } from "shared/types/guest";
import { Socket, Namespace } from "socket.io";

declare module "socket.io" {
  interface Socket {
    user: AuthenticatedUser;
  }
}

export interface SocketContext<T = unknown> {
  socket: Socket;
  payload: T;
  channel: Namespace;
}
