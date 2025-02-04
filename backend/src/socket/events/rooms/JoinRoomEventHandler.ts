import { getRoomState, saveRoomState } from "src/redis/room";
import { SocketContext } from "../../../@types/socket";
import getRoomPlayers from "@socket/utils/getRoomPlayers";
import emitToRoom from "@socket/utils/emitToRoom";
import emitToUser from "src/socket/utils/emitToUser";
import { getGameState } from "src/redis/game";
import ErrorHandler from "src/utils/error.handler";

export async function JoinRoomEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  try {
    const { roomHash } = payload;
    console.log({
      roomHash,
      user: socket.user,
    });
    if (!roomHash || !socket.user) return;
    const room = await getRoomState(roomHash);
    if (!room) throw "ROOM_NOT_FOUND";
    socket.join(roomHash);
    socket.user.room = roomHash;
    switch (room.status) {
      case "open": {
        const roomPlayers = getRoomPlayers(roomHash, channel);
        if (roomPlayers.length > room.size) throw "ROOM_IS_FULL";

        socket.user.status = "NOT_READY";
        break;
      }
      case "playing": {
        const game = await getGameState(roomHash);

        if (
          game &&
          game.players.find((player) => player.userId === socket.user?.id)
        ) {
          emitToUser(socket, "info", "WELCOME_BACK");
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
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
