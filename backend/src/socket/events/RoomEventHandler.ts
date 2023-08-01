import { SocketContext } from "../../@types/socket";
import prisma from "../../prisma";


export async function RoomEventHandler(
    context: SocketContext,
): Promise<void> {
    try {
        const { payload, socket, channel } = context
        const { roomId } = payload;
        const room = await prisma.room.findFirst({ where: { hash: roomId }, include: { chat: true } })
        if (!room) {
            socket.emit("error", "A sala não foi encontrada.")
            return
        }

        if (room.players.length > 4) {
            socket.emit("error", "A sala já está cheia.")
            return
        }
        socket.join(roomId);
        if (!room.players.some(x => x === socket.user.email)) {
            room.players.push(socket.user.email)
            await prisma.room.update({ where: { id: room.id }, data: { players: room.players } })
        }
        socket.broadcast.to(roomId).emit("user_joined", `O usuário ${socket.user?.name} entrou na partida.`);
        if (room.players.length === 4)
            channel.to(roomId).emit("match_started", room.players)

    } catch (er) {

    }
}