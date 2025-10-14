import { SocketContext } from "../../../@types/socket";
import emitToRoom from "@socket/utils/emitToRoom";
import { addMessage } from "./addMessage";
import { logger } from "@utils/logger";
import { SendMessagePayload } from "../payloads";

export async function SendMessageEventHandler(
  context: SocketContext<SendMessagePayload>
): Promise<void> {
  try {
    const { payload, socket, channel } = context;
    const roomHash = payload.roomHash;
    const messageDoc = {
      message: payload.message,
      name: socket.user.name,
      createdAt: new Date(),
    };
    await addMessage(roomHash, messageDoc);
    emitToRoom(channel, roomHash, "receive_message", messageDoc);
    logger.info(`Emitted to: ${roomHash} - ${messageDoc.message}`);
  } catch (error) {
    logger.error(error);
  }
}
