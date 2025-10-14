import { GuestType, SocketUser } from "shared/types";
import { Socket, Namespace } from "socket.io";

declare module "socket.io" {
  interface Socket {
    user: SocketUser | GuestType;
  }
}

export interface SocketContext<T = unknown> {
  socket: Socket;
  payload: T;
  channel: Namespace;
}
