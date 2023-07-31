import { Server, Socket, Namespace } from "socket.io";
import http from "http";
import { CHANNEL } from "./channels";

class SocketClass {
  static io: Server;
  static socket: Socket;
  static roomChannel: Namespace;
  static chatChannel: Namespace;
  static init(server: http.Server) {
    this.io = new Server(server, {
      pingTimeout: 1000,
      cors: {
        origin: "*",
      },
    });
    this.io.on(CHANNEL.CLIENT.CONNECTION, (socket: Socket) => {
      console.log(`Socket Id: ${socket.id}`);
      this.socket = socket;

      this.socket.on(
        CHANNEL.CLIENT.PLAY_CARD,
        (roomId: string, callback) => {}
      );
    });
  }
}

export default SocketClass;
