import { SocketContext } from "../../../@types/socket";
import prisma from "../../../prisma";

export async function LeaveRoomEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  channel.to(socket.user.room).emit("quit", JSON.stringify(socket.user));
}
