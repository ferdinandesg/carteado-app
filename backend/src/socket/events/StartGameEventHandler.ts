import { SocketContext } from "../../@types/socket";

export async function StartGameEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { payload, socket, channel } = context;
    const { roomId } = payload;
  } catch (er) {
    
  }
}
