import { SocketContext } from "../../../@types/socket";
import emitToRoom from "@socket/utils/emitToRoom";
import { addMessage } from "./addMessage";

export async function SendMessageEventHandler(
  context: SocketContext
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
    console.log(`Emitted to: ${roomHash} - ${messageDoc.message}`);
  } catch (error) {
    console.error(error);
  }
}
