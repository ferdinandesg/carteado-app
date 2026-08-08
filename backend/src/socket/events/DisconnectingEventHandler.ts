import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { SocketContext } from "@/@types/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import { CHANNEL } from "@/socket/channels";
import { GameStatus, PlayerStatus } from "shared/game";
import { socketLogger } from "@/utils/logContext";

export async function DisconnectingEventHandler(
  context: Omit<SocketContext, "payload">
): Promise<void> {
  const { socket, channel } = context;
  const roomHash = socket.user.room;
  const userId = socket.user.id;
  const log = socketLogger(socket);

  if (!roomHash) return;

  log.info({ roomHash }, "User disconnecting.");

  const updatedRoom = await atomicallyUpdateRoomState(roomHash, (room) => {
    const participant = room.participants.find((p) => p.userId === userId);
    if (participant) {
      participant.isOnline = false;
      participant.status =
        room.status === GameStatus.PLAYING
          ? participant.status
          : PlayerStatus.NOT_READY;
    }
    return room;
  });

  if (updatedRoom) {
    emitToRoom(channel, roomHash, CHANNEL.SERVER.ROOM_UPDATED, updatedRoom);
    log.info({ roomHash }, "User marked as offline.");
  }
}
