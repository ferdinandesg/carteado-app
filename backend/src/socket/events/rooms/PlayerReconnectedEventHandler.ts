import { getRoomState } from "src/redis/room";
import { SocketContext } from "../../../@types/socket";
import { getGameState } from "src/redis/game";
import ErrorHandler from "src/utils/error.handler";
import emitToUser from "@socket/utils/emitToUser";
import { PlayerReconnectedPayload } from "../payloads";

export async function PlayerReconnectedEventHandler(
  context: SocketContext<PlayerReconnectedPayload>
): Promise<void> {
  const { payload, socket } = context;
  try {
    const { roomHash } = payload;
    if (!roomHash || !socket.user) return;
    const room = await getRoomState(roomHash);
    if (!room) throw "ROOM_NOT_FOUND";
    const game = await getGameState(roomHash);
    emitToUser(socket, "game_updated", game);
    emitToUser(socket, "room_updated", room);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
