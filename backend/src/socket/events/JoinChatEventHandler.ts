import { Socket } from "dgram";
import { Namespace } from "socket.io";
import { SocketContext } from "../../@types/socket";
import prisma from "../../prisma";

export async function JoinChatEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  const room = await prisma.room.findFirst({
    where: { id: socket.user.room },
    include: { chat: { select: { messages: true } } },
  });
  socket.emit("load_messages", room.chat);
}
