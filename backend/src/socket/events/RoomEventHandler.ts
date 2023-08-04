import { SocketContext } from "../../@types/socket";
import prisma from "../../prisma";

export async function RoomEventHandler(context: SocketContext): Promise<void> {
  try {
    const { payload, socket, channel } = context;
    const { roomId } = payload;
    const room = await prisma.room.findFirst({
      where: { hash: roomId, status: "open" },
      include: { chat: true, players: { include: { user: true } } },
    });
    if (!room) {
      socket.emit("error", "A sala não foi encontrada.");
      return;
    }

    if (room.players.length > 4) {
      socket.emit("error", "A sala já está cheia.");
      return;
    }
    room.players.forEach(
      (x) => (x.isOnline = channel.adapter.rooms.has(x.user.email))
    );
    socket.join(roomId);
    socket.user.room = roomId;
    socket.emit("load_messages", room.chat);
    socket.emit("load_players", JSON.stringify(room.players));

    if (!room.players.some((x) => x.user.email === socket.user.email)) {
      await prisma.player.create({
        data: { userId: socket.user.id, roomId: room.id },
      });
    }
    channel.to(roomId).emit(
      "user_joined",
      JSON.stringify({
        message: `O usuário ${socket.user?.name} entrou na partida.`,
        player: { user: socket.user, isOnline: true },
      })
    );
  } catch (er) {
    console.log(er);
  }
}
