import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { SocketContext } from "@/@types/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import ErrorHandler from "@/utils/error.handler";
import { SetPlayerStatusPayload } from "../payloads";
import { CHANNEL } from "@/socket/channels";
import { setPlayerStatusSchema } from "@/schemas/socket.schemas";
import { parsePayload, requireRoom } from "../handleGameAction";

export async function SetPlayerStatusEventHandler(
  context: SocketContext<SetPlayerStatusPayload>
): Promise<void> {
  const { socket, payload, channel } = context;
  try {
    const roomHash = requireRoom(socket);
    const { status } = parsePayload(setPlayerStatusSchema, payload);

    const room = await atomicallyUpdateRoomState(roomHash, (room) => {
      const participant = room.participants.find(
        (p) => p.userId === socket.user.id
      );
      if (!participant) throw "USER_NOT_IN_ROOM";
      participant.status = status;
      return room;
    });
    if (!room) throw "ROOM_NOT_FOUND";

    emitToRoom(channel, roomHash, CHANNEL.SERVER.ROOM_UPDATED, room);
    socket.log.info({ roomHash, status }, "Player status updated.");
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
