import { Socket, Namespace } from "socket.io"

declare module 'socket.io' {
  interface Socket {
    user?: {
      email: string;
      name: string;
      image: string;
    }
  }
}

export interface SocketContext {
  socket: Socket
  payload?: {
    error?: string
    roomId?: string
    message?: string
  }
  channel: Namespace
}
