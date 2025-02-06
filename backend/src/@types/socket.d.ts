import { Card } from "shared/cards";
import { GuestType, SocketUser } from "shared/types";
import { Socket, Namespace } from "socket.io";

declare module "socket.io" {
  interface Socket {
    user: SocketUser | GuestType;
  }
}

export interface SocketContext {
  socket: Socket;
  payload: {
    error: string;
    roomHash: string;
    status: string;
    message: string;
    card: Card;
    cards: Card[];
  };
  channel: Namespace;
}
