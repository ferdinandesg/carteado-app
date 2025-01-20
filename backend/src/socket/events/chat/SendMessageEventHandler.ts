import { Chat, Message } from "@prisma/client";
import { SocketContext } from "../../../@types/socket";
import prisma from "../../../prisma";
import { saveMessages } from "../../../redis/actions";

const addMessage = async (roomId: string, message: Message): Promise<Chat> => {
  const room = await prisma.room.findFirst({
    where: { hash: roomId },
    include: { chat: true },
  });
  room.chat.messages.push(message);
  const chat = await prisma.chat.update({
    where: { id: room.chatId },
    data: { messages: { set: room.chat.messages } },
  });
  return chat
}

export async function SendMessageEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { payload, socket, channel } = context;
    const roomId = socket.user.room;
    const messageDoc = {
      message: payload.message,
      name: socket.user.name,
      createdAt: new Date(),
    };
    const chat = await addMessage(roomId, messageDoc);
    await saveMessages(roomId, chat.messages);
    channel.to(roomId).emit("receive_message", messageDoc);
    console.log(`Emitted to: ${roomId} - ${messageDoc.message}`);
  } catch (error) {
    console.error(error);
  }
}
