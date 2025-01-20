import { SocketContext } from "../../../@types/socket";
import prisma from "../../../prisma";
import { getMessages } from "../../../redis/actions";

export async function JoinChatEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket } = context;
  const messages = await getMessages(socket.user.room);
  socket.emit("load_messages", messages);
  console.log(`Emitted to: ${socket.user.room} - load_messages`);
}
