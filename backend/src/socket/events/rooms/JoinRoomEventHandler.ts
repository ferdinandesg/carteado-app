import { getRoomState, saveRoomState } from "src/redis/room";
import { SocketContext } from "../../../@types/socket";
import emitToRoom from "@socket/utils/emitToRoom";
import emitToUser from "src/socket/utils/emitToUser";
import { getGameState } from "src/redis/game";
import ErrorHandler from "src/utils/error.handler";
import { createParticipantObject } from "shared/game";
import { storeSession } from "src/redis/userSession";

export async function JoinRoomEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  try {
    const { roomHash } = payload;
    if (!roomHash || !socket.user) return;
    const room = await getRoomState(roomHash);
    if (!room) throw "ROOM_NOT_FOUND";
    socket.join(roomHash);
    socket.user.room = roomHash;
    switch (room.status) {
      case "open": {
        if (room.participants?.length > room.size) throw "ROOM_IS_FULL";
        const participants = createParticipantObject(socket.user);
        room.participants.push(participants);

        socket.user.status = "not_ready";
        break;
      }
      case "playing": {
        const game = await getGameState(roomHash);
        const isPlayer = game?.players.findIndex(
          (player) => player.userId === socket.user.id
        );
        if (isPlayer === -1) throw "ROOM_IS_PLAYING";
        // Se o jogador que está entrando já faz parte do jogo em andamento, enviamos o estado atual do jogo para ele
        emitToUser(socket, "info", "WELCOME_BACK");
        emitToRoom(channel, roomHash, "game_updated", game);

        break;
      }
      default:
        return;
    }
    await storeSession(socket, roomHash);
    await saveRoomState(roomHash, room);
    emitToRoom(channel, roomHash, "room_updated", room);
    emitToRoom(socket, roomHash, "user_joined", {
      message: `O usuário ${socket.user.name} entrou na sala.`,
      players: { user: socket.user, isOnline: true },
    });
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
