// import { Card } from "@prisma/client";
import { Socket, Namespace } from "socket.io";
import Deck, { Card } from "../../cards/interface";

declare module "socket.io" {
  interface Socket {
    user?: {
      id: string;
      email: string;
      name: string;
      image: string;
      rank: number;
      room?: string;
    };
  }
}

export interface SocketContext {
  socket: Socket;
  payload?: {
    error?: string;
    roomId?: string;
    message?: string;
    card?: Card
    cards?: Card[]
  };
  channel: Namespace;
}
