import emitToUser from "src/socket/utils/emitToUser";
import { SocketContext } from "../../../@types/socket";
import { getMessages } from "../../../redis/chat";
import emitToRoom from "@socket/utils/emitToRoom";

export async function JoinChatEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, payload } = context;
  const roomHash = payload?.roomHash;
  if (!roomHash || !socket.user) return;
  const messages = await getMessages(roomHash);
  // should emit to the user who is requesting
  emitToUser(socket, "load_messages", messages);
  emitToRoom(socket, roomHash, "join_chat", {
    name: "system",
    message: `${socket.user.name} entrou na sala`,
  });
  console.log(
    `Emitted to: ${roomHash} - load_messages for ${socket.user.name}`
  );
}
