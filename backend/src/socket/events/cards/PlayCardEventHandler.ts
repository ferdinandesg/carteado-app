import emitToRoom from "@/socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import { getGameState, saveGameState } from "@/lib/redis/game";
import ErrorHandler from "utils/error.handler";
import { PlayCardPayload } from "../payloads";

export async function PlayCardEventHandler(
  context: SocketContext<PlayCardPayload>
): Promise<void> {
  const { payload, socket, channel } = context;
  try {
    const { card } = payload;
    const roomHash = socket.user.room;
    if (!roomHash) throw "ROOM_NOT_FOUND";
    const game = await getGameState(roomHash);
    game.playCard(socket.user.id, card);

    await saveGameState(roomHash, game);
    emitToRoom(channel, roomHash, "game_updated", game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
