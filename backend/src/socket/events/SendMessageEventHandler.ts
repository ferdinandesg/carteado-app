import { SocketContext } from "../../@types/socket";
import prisma from "../../prisma";

export async function SendMessageEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { payload, socket, channel } = context;
    const roomId = socket.user.room;
    const room = await prisma.room.findFirst({
      where: { hash: roomId },
      include: { chat: true, players: true },
    });
    const messageDoc = {
      message: payload.message,
      name: socket.user.name,
      createdAt: new Date(),
    };
    room.chat.messages.push(messageDoc);
    await prisma.chat.update({
      where: { id: room.chatId },
      data: { messages: { set: room.chat.messages } },
    });
    channel.to(roomId).emit("receive_message", messageDoc);
    console.log(`Emitted to: ${roomId} - ${messageDoc.message}`);
  } catch (error) {
    console.log(error);
  }
}
