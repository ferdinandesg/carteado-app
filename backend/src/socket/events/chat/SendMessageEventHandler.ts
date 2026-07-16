import { SocketContext } from "@/@types/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import { addMessage } from "./addMessage";
import { SendMessagePayload } from "../payloads";
import { CHANNEL } from "@/socket/channels";

export async function SendMessageEventHandler(
  context: SocketContext<SendMessagePayload>
): Promise<void> {
  const { payload, socket, channel } = context;
  const roomHash = payload.roomHash;
  try {
    const messageDoc = {
      message: payload.message,
      name: socket.user.name,
      createdAt: new Date(),
    };
    await addMessage(roomHash, messageDoc);
    emitToRoom(channel, roomHash, CHANNEL.SERVER.RECEIVE_MESSAGE, messageDoc);
    socket.log.info({ roomHash }, "Chat message sent.");
  } catch (error) {
    socket.log.error({ err: error, roomHash }, "Failed to send chat message.");
  }
}
