import { getRoomState, saveRoomState } from "@/lib/redis/room";
import { SocketContext } from "../../../@types/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import ErrorHandler from "utils/error.handler";
import { logger } from "@/utils/logger";
import { SetPlayerStatusPayload } from "../payloads";

export async function SetPlayerStatusEventHandler(
  context: SocketContext<SetPlayerStatusPayload>
): Promise<void> {
  const { socket, payload, channel } = context;
  try {
    if (!socket.user?.room || !socket.user) return;
    const { status } = payload;
    const roomHash = socket.user.room;
    if (!roomHash) throw "USER_NOT_IN_ROOM";
    const room = await getRoomState(roomHash);
    const participant = room?.participants.find(
      (p) => p.userId === socket.user.id
    );
    if (!participant) throw "USER_NOT_IN_ROOM";
    participant.status = status;
    if (!room) throw "ROOM_NOT_FOUND";
    await saveRoomState(roomHash, room); // Salvamos o estado atualizado da sala
    if (!room) throw "ROOM_NOT_FOUND";
    emitToRoom(channel, roomHash, "room_updated", room);
    logger.info(`User ${socket.user.name} is ${participant.status}`);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
