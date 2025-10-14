import { Server, Socket, Namespace } from "socket.io";
import http from "http";
import { CHANNEL } from "./channels";
import { ConnectionEventHandler } from "./events/ConnectionEventHandler";
import { Authentication } from "./events/middleware/AuthSocket";

export class SocketServer {
  public readonly io: Server;
  public readonly roomChannel: Namespace;
  public readonly chatChannel: Namespace;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      pingTimeout: 1000,
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
