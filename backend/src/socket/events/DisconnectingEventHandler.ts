import { SocketContext } from "../../@types/socket";

export async function DisconnectingEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  channel.to(socket.user.room).emit("quit", JSON.stringify(socket.user));
  console.log(`Disconnected: ${socket.id}`);
}
