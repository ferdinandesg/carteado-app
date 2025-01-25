import emitToUser from "src/socket/utils/emitToUser";
import { SocketContext } from "../../../@types/socket";
import { getMessages } from "../../../redis/chat";
import emitToRoom from "@socket/utils/emitToRoom";

export async function JoinChatEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, payload } = context;
  const roomId = payload?.roomId;
  if (!roomId || !socket.user) return;
  const messages = await getMessages(roomId);
  // should emit to the user who is requesting
  emitToUser(socket, "load_messages", messages);
  emitToRoom(socket, roomId, "join_chat", {
    name: "system",
    message: `${socket.user.name} entrou na sala`,
  });
  console.log(`Emitted to: ${roomId} - load_messages for ${socket.user.name}`);
}
