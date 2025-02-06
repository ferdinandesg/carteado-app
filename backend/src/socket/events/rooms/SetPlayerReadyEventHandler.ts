import { getRoomState } from "src/redis/room";
import { SocketContext } from "../../../@types/socket";
import getRoomPlayers from "src/socket/utils/getRoomPlayers";
import emitToRoom from "@socket/utils/emitToRoom";
import ErrorHandler from "src/utils/error.handler";

export async function SetPlayerStatusEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, payload, channel } = context;
  try {
    if (!socket.user?.room || !socket.user) return;
    socket.user.status = payload.status;
    const roomHash = socket.user.room;
    if (!roomHash) throw "USER_NOT_IN_ROOM";
    const room = await getRoomState(roomHash);
    if (!room) throw "ROOM_NOT_FOUND";
    const players = getRoomPlayers(roomHash, channel);
    emitToRoom(channel, roomHash, "room_update", {
      room,
      players,
    });
    console.log(`User ${socket.user.name} is ${socket.user.status}`);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
