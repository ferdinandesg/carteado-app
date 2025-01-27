import { Server, Socket, Namespace } from "socket.io";
import http from "http";
import { CHANNEL } from "./channels";
import { ConnectionEventHandler } from "./events/ConnectionEventHandler";
import { Authentication } from "./events/middleware/AuthSocket";

class SocketClass {
  static io: Server;
  static socket: Socket;
  static roomChannel: Namespace;
  static chatChannel: Namespace;
  static init(server: http.Server) {
    this.io = new Server(server, {
      pingTimeout: 1000,
      cors: {
        origin: "https://carteado.ferdinandes.com.br",
        methods: ["GET", "POST"],
      },
    });
    this.roomChannel = this.io.of("/api/v1/room");
    this.roomChannel.use(Authentication);
    this.roomChannel.on(CHANNEL.CLIENT.CONNECTION, async (socket: Socket) =>
      ConnectionEventHandler(socket, this.roomChannel)
    );
  }
}

export default SocketClass;
