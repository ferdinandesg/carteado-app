import { Card } from "shared/cards";
import { PlayerStatus } from "shared/game";
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
    status: PlayerStatus;
    message: string;
    card: Card;
    cards: Card[];
  };
  channel: Namespace;
}
