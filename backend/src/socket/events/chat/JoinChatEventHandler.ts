import { SocketContext } from "../../../@types/socket";
import { getMessages } from "../../../redis/chat";

export async function JoinChatEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const messages = await getMessages(socket.user.room);
  // should emit to the user who is requesting
  socket.emit("load_messages", messages);
  console.log(`Emitted to: ${socket.user.room} - load_messages`);
}
