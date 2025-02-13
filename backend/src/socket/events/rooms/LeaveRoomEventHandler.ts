import { SocketContext } from "../../../@types/socket";

export async function LeaveRoomEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  if (!socket.user?.room) return;
  channel.to(socket.user.room).emit("quit", JSON.stringify(socket.user));
}
