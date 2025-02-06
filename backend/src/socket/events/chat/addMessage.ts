import { Chat, Message } from "@prisma/client";
import prisma from "src/prisma";
import { saveMessages } from "src/redis/chat";

export const addMessage = async (
  roomHash: string,
  message: Message
): Promise<Chat> => {
  const room = await prisma.room.findFirst({
    where: { hash: roomHash },
    include: { chat: true },
  });
  if (!room) throw new Error("ROOM_NOT_FOUND");
  room.chat.messages.push(message);
  const chat = await prisma.chat.update({
    where: { id: room.chatId },
    data: { messages: { set: room.chat.messages } },
  });
  await saveMessages(roomHash, chat.messages);
  return chat;
};
