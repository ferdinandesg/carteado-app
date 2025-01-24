import { getRoomState, saveRoomState } from "src/redis/room";
import { SocketContext } from "../../../@types/socket";
import getRoomPlayers from "src/socket/utils/getRoomPlayers";
import emitToRoom from "src/socket/utils/emitToRoom";
import emitToUser from "src/socket/utils/emitToUser";
import prisma from "src/prisma";
import { getGameState } from "src/redis/game";

export async function JoinRoomEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { payload, socket, channel } = context;
    const { roomId } = payload;
    const room = await getRoomState(roomId);
    if (!room) return;

    switch (room.status) {
      case "open":
        const roomPlayers = getRoomPlayers(roomId, channel);
        if (roomPlayers.length >= room.size) throw "A sala está cheia.";
        if (roomPlayers.find((player) => player.id === socket.user.id))
          throw "Você já está na sala.";
        socket.join(roomId);
        socket.user.room = roomId;
        socket.user.status = "NOT_READY";
        break;
      case "playing":
        const currentPlayers = await getGameState(room.hash);
        if (
          currentPlayers.players.find(
            (player) => player.userId === socket.user.id
          )
        ) {
          socket.join(roomId);
          socket.user.room = roomId;
          emitToUser(socket, "info", "Bem vindo de volta");
          break;
        }
        room.spectators.push(socket.user);
        await saveRoomState(roomId, room);
        break;
      default:
        return;
    }
    const updatedRoom = await getRoomState(roomId);
    const newPlayers = getRoomPlayers(roomId, channel);

    emitToRoom(channel, roomId, "room_update", {
      room: updatedRoom,
      players: newPlayers,
    });
    emitToRoom(socket, roomId, "user_joined", {
      message: `O usuário ${socket.user.name} entrou na sala.`,
      players: { user: socket.user, isOnline: true },
    });
  } catch (er) {
    if (typeof er === "string") {
      context.socket.emit("error", { message: er });
      return;
    }
    throw er;
  }
}
