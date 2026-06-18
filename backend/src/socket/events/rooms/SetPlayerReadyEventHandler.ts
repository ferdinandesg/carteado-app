import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { SocketContext } from "@/@types/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import ErrorHandler from "@/utils/error.handler";
import { logger } from "@/utils/logger";
import { SetPlayerStatusPayload } from "../payloads";
import { CHANNEL } from "@/socket/channels";

export async function SetPlayerStatusEventHandler(
  context: SocketContext<SetPlayerStatusPayload>
): Promise<void> {
  const { socket, payload, channel } = context;
  try {
    if (!socket.user?.room || !socket.user) return;
    const { status } = payload;
    const roomHash = socket.user.room;
    if (!roomHash) throw "USER_NOT_IN_ROOM";
    let updatedStatus = status;

    const room = await atomicallyUpdateRoomState(roomHash, (room) => {
      const participant = room.participants.find(
        (p) => p.userId === socket.user.id
      );
      if (!participant) throw "USER_NOT_IN_ROOM";
      participant.status = status;
      updatedStatus = participant.status;
      return room;
    });
    if (!room) throw "ROOM_NOT_FOUND";
    emitToRoom(channel, roomHash, CHANNEL.SERVER.ROOM_UPDATED, room);
    logger.info(`User ${socket.user.name} is ${updatedStatus}`);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
