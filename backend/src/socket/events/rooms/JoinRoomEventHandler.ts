import { getRoomState, saveRoomState } from "src/redis/room";
import { SocketContext } from "../../../@types/socket";
import getRoomPlayers from "@socket/utils/getRoomPlayers";
import emitToRoom from "@socket/utils/emitToRoom";
import emitToUser from "src/socket/utils/emitToUser";
import { getGameState } from "src/redis/game";

export async function JoinRoomEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { payload, socket, channel } = context;
    const { roomHash } = payload;
    if (!roomHash || !socket.user) return;
    const room = await getRoomState(roomHash);
    if (!room) return;

    switch (room.status) {
      case "open": {
        const roomPlayers = getRoomPlayers(roomHash, channel);
        if (roomPlayers.length >= room.size) throw "A sala está cheia.";
        if (roomPlayers.find((player) => player.id === socket.user?.id))
          throw "Você já está na sala.";
        socket.join(roomHash);
        socket.user.room = roomHash;
        socket.user.status = "NOT_READY";
        break;
      }
      case "playing": {
        const currentPlayers = await getGameState(roomHash);

        if (
          currentPlayers &&
          currentPlayers.players.find(
            (player) => player.userId === socket.user?.id
          )
        ) {
          socket.join(roomHash);
          socket.user.room = roomHash;
          emitToUser(socket, "info", "Bem vindo de volta");
          break;
        }
        room.spectators.push(socket.user);
        await saveRoomState(roomHash, room);
        break;
      }
      default:
        return;
    }
    const updatedRoom = await getRoomState(roomHash);
    const newPlayers = getRoomPlayers(roomHash, channel);

    emitToRoom(channel, roomHash, "room_update", {
      room: updatedRoom,
      players: newPlayers,
    });
    emitToRoom(socket, roomHash, "user_joined", {
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
