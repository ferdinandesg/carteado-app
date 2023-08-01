import { SocketContext } from "../../@types/socket";
import prisma from "../../prisma";


export async function SendMessageEventHandler(
    context: SocketContext,
): Promise<void> {
    const { payload, socket, channel } = context
    const { roomId } = payload;
    const room = await prisma.room.findFirst({ where: { hash: roomId }, include: { chat: true } })
    const messageDoc = { message: payload.message, name: socket.user.name, chatId: room.chatId }
    const message = await prisma.message.create({ data: messageDoc })
    channel.to(roomId).emit("receive_message", messageDoc)
}