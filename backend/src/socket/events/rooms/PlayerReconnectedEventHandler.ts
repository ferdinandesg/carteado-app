import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { SocketContext } from "@/@types/socket";
import ErrorHandler from "@/utils/error.handler";
import emitToUser from "@/socket/utils/emitToUser";
import { PlayerReconnectedPayload } from "../payloads";
import { getGameInstance } from "@/services/game.service";
import { CHANNEL } from "@/socket/channels";

export async function PlayerReconnectedEventHandler(
  context: SocketContext<PlayerReconnectedPayload>
): Promise<void> {
  const { payload, socket } = context;
  try {
    const { roomHash } = payload;
    if (!roomHash || !socket.user) return;
    const room = await atomicallyUpdateRoomState(roomHash, (room) => {
      const participant = room.participants.find(
        (p) => p.userId === socket.user.id
      );
      if (!participant) throw "USER_NOT_IN_ROOM";
      participant.isOnline = true;
      socket.user.status = participant.status;
      return room;
    });
    if (!room) throw "ROOM_NOT_FOUND";
    const game = await getGameInstance(roomHash);
    emitToUser(socket, CHANNEL.SERVER.GAME_UPDATED, game);
    emitToUser(socket, CHANNEL.SERVER.ROOM_UPDATED, room);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
