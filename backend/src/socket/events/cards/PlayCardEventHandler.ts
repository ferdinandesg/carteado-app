import emitToRoom from "@/socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import ErrorHandler from "utils/error.handler";
import { PlayCardPayload } from "../payloads";
import { getGameInstance, saveGameInstance } from "@/services/game.service";
import { logger } from "@/utils/logger";

export async function PlayCardEventHandler(
  context: SocketContext<PlayCardPayload>
): Promise<void> {
  const { payload, socket, channel } = context;
  try {
    const { card } = payload;
    const roomHash = socket.user.room;
    if (!roomHash) throw "ROOM_NOT_FOUND";
    const game = await getGameInstance(roomHash);
    game.playCard(socket.user.id, card);
    logger.info(
      { user: { id: socket.user.id }, room: { hash: roomHash }, card },
      "Card played."
    );
    await saveGameInstance(roomHash, game);
    emitToRoom(channel, roomHash, "game_updated", game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
