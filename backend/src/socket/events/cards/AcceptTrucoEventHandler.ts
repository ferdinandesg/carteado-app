import emitToRoom from "@/socket/utils/emitToRoom";
import { SocketContext } from "@/@types/socket";
import ErrorHandler from "@/utils/error.handler";
import { acceptTruco } from "@/services/game.service";
import { CHANNEL } from "@/socket/channels";

export async function AcceptTrucoEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const roomHash = socket.user.room;
    if (!roomHash) throw "ROOM_NOT_FOUND";
    const game = await acceptTruco(roomHash, socket.user.id);
    emitToRoom(channel, roomHash, CHANNEL.SERVER.GAME_UPDATED, game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
