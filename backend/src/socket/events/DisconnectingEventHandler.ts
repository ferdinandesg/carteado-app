import { SocketContext } from "../../@types/socket";
import prisma from "../../prisma";

export async function DisconnectingEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket } = context;
  console.log({userDisconnected: socket.user});
  
  socket.broadcast.emit("quit", JSON.stringify(socket.user));
  console.log(`Disconnected: ${socket.id}`);
}
