import emitToRoom from "@/socket/utils/emitToRoom";
import { SocketContext } from "@/@types/socket";
import ErrorHandler from "@/utils/error.handler";
import { PlayCardPayload } from "../payloads";
import { playCard } from "@/services/game.service";
import { CHANNEL } from "@/socket/channels";

export async function PlayCardEventHandler(
  context: SocketContext<PlayCardPayload>
): Promise<void> {
  const { payload, socket, channel } = context;
  try {
    const { card } = payload;
    const roomHash = socket.user.room;
    if (!roomHash) throw "ROOM_NOT_FOUND";
    const game = await playCard(roomHash, socket.user.id, card);
    socket.log.info({ roomHash, card }, "Card played.");
    emitToRoom(channel, roomHash, CHANNEL.SERVER.GAME_UPDATED, game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
