import emitToUser from "socket/utils/emitToUser";
import { getMessages } from "@/lib/redis/chat";
import emitToRoom from "@/socket/utils/emitToRoom";
import { logger } from "@/utils/logger";
import { JoinChatPayload } from "../payloads";
import { SocketContext } from "@/@types/socket";

export async function JoinChatEventHandler(
  context: SocketContext<JoinChatPayload>
): Promise<void> {
  const { socket, payload } = context;
  const roomHash = payload?.roomHash;
  if (!roomHash || !socket.user) return;
  socket.join(roomHash);
  const messages = await getMessages(roomHash);
  // should emit to the user who is requesting
  emitToUser(socket, "load_messages", messages);
  emitToRoom(socket, roomHash, "join_chat", {
    name: "system",
    message: socket.user.name,
  });
  logger.info(
    `Emitted to: ${roomHash} - load_messages for ${socket.user.name}`
  );
}
