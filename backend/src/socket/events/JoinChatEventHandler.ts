import { Socket } from "dgram";
import { Namespace } from "socket.io";
import { SocketContext } from "../../@types/socket";
import prisma from "../../prisma";

export async function JoinChatEventHandler(
    context: SocketContext,
): Promise<void> {
    const { payload, socket, channel } = context
    const { roomId } = payload;
    const room = await prisma.room.findFirst({ where: { id: roomId }, include: { chat: true } })
    socket.emit("load_messages", room.chat)
}