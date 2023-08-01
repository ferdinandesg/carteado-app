import { SocketContext } from "../../@types/socket";
import prisma from "../../prisma";


export async function RoomEventHandler(
    context: SocketContext,
): Promise<void> {
    try {
        const { payload, socket, channel } = context
        const { roomId } = payload;
        const room = await prisma.room.findFirst({ where: { id: roomId }, include: { chat: { select: { messages: true } } } })

        if (!room) {
            socket.emit("error", "A sala não foi encontrada.")
            return
        }
        if (room.players.length > 4) {
            socket.emit("error", "A sala já está cheia.")
            return
        }
        socket.join(roomId);
        socket.emit("load_messages", room.chat);
        console.log(`User: ${socket.user.name} joined to room: ${room.hash}`);

        if (!room.players.some(x => x === socket.user.email)) {
            room.players.push(socket.user.email)
            prisma.room.update({ where: { id: room.id }, data: { players: room.players } })
        }
        console.log({ users: channel.adapter.rooms.get(roomId) });

        channel.to(roomId).emit("user_joined", `O usuário ${socket.user?.name} entrou na partida.`);

    } catch (er) {

    }
}