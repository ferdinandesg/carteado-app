import { Chat, Message } from "@prisma/client";
import { SocketContext } from "../../../@types/socket";
import prisma from "../../../prisma";
import { saveMessages } from "../../../redis/chat";
import emitToRoom from "@socket/utils/emitToRoom";

const addMessage = async (
  roomHash: string,
  message: Message
): Promise<Chat> => {
  const room = await prisma.room.findFirst({
    where: { hash: roomHash },
    include: { chat: true },
  });
  if (!room) throw new Error("Sala não encontrada");
  room.chat.messages.push(message);
  const chat = await prisma.chat.update({
    where: { id: room.chatId },
    data: { messages: { set: room.chat.messages } },
  });
  return chat;
};

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
    const chat = await addMessage(roomHash, messageDoc);
    await saveMessages(roomHash, chat.messages);

    emitToRoom(channel, roomHash, "receive_message", messageDoc);
    console.log(`Emitted to: ${roomHash} - ${messageDoc.message}`);
  } catch (error) {
    console.error(error);
  }
}
