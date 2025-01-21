import { getRoomState } from "src/redis/room";
import { SocketContext } from "../../../@types/socket";
import getRoomPlayers from "src/socket/utils/getRoomPlayers";
import emitToRoom from "src/socket/utils/emitToRoom";

export async function SetPlayerStatusEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, payload, channel } = context;
  socket.user.status = payload.status;
  const roomHash = socket.user.room;
  if (!roomHash) return;
  const room = await getRoomState(roomHash);
  if (!room) return;
  const players = getRoomPlayers(roomHash, channel);
  emitToRoom(channel, roomHash, "room_update", {
    room,
    players,
  });
  console.log(`User ${socket.user.name} is ${socket.user.status}`);
}
