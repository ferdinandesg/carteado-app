import { getRoomState } from "src/redis/room";
import { SocketContext } from "../../@types/socket";
import getRoomPlayers from "../utils/getRoomPlayers";
import emitToRoom from "../utils/emitToRoom";

export async function DisconnectingEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const roomHash = socket.user.room;
  if (!roomHash) return;
  const room = await getRoomState(roomHash);
  if (!room) return;
  const players = getRoomPlayers(roomHash, channel);
  emitToRoom(channel, roomHash, "room_update", {
    room,
    players,
  });
  console.log(`Disconnected: ${socket.id}`);
}
