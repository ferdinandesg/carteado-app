import { getRoomState } from "@/lib/redis/room";
import { SocketContext } from "../../../@types/socket";
import ErrorHandler from "utils/error.handler";
import emitToUser from "@/socket/utils/emitToUser";
import { PlayerReconnectedPayload } from "../payloads";
import { getGameInstance } from "@/services/game.service";

export async function PlayerReconnectedEventHandler(
  context: SocketContext<PlayerReconnectedPayload>
): Promise<void> {
  const { payload, socket } = context;
  try {
    const { roomHash } = payload;
    if (!roomHash || !socket.user) return;
    const room = await getRoomState(roomHash);
    if (!room) throw "ROOM_NOT_FOUND";
    const game = await getGameInstance(roomHash);
    emitToUser(socket, "game_updated", game);
    emitToUser(socket, "room_updated", room);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
