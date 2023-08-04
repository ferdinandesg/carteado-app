import { SocketContext } from "../../@types/socket";
import GameClass from "../../game/game";

export async function DrawTableEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const result = GameClass.drawTable(socket.user.id);
    console.log({newHand: result.player.hand});
    
    channel
      .to(socket.user.room)
      .emit(
        "refresh_cards",
        JSON.stringify({ bunch: GameClass.bunch, player: result.player })
      );
  } catch (er) {
    console.error(er);
    socket.emit("error", er.message);
  }
}
