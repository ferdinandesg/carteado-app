import { Server, Socket, Namespace } from "socket.io";
import http from "http";
import { CHANNEL } from "shared/socket";
import { ConnectionEventHandler } from "./events/ConnectionEventHandler";
import { Authentication } from "./events/middleware/AuthSocket";

export class SocketServer {
  public readonly io: Server;
  public readonly roomChannel: Namespace;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      pingTimeout: 20000,
      pingInterval: 10000,
      path: "/carteado_socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.roomChannel = this.io.of("/room");

    this.roomChannel.use(Authentication);
    this.roomChannel.on(CHANNEL.CLIENT.CONNECTION, (socket: Socket) =>
      ConnectionEventHandler(socket, this.roomChannel)
    );
  }
}
