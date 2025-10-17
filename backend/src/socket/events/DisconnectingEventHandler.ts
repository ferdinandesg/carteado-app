import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { SocketContext } from "../../@types/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import { expireSession } from "@/lib/redis/userSession";
import { logger } from "@/utils/logger";

export async function DisconnectingEventHandler(
  context: Omit<SocketContext, "payload">
): Promise<void> {
  const { socket, channel } = context;
  const roomHash = socket.user.room;
  const userId = socket.user.id;

  if (!roomHash) return;

  logger.info({ userId, roomHash }, "User disconnecting.");

  const updatedRoom = await atomicallyUpdateRoomState(roomHash, (room) => {
    const participant = room.participants.find((p) => p.userId === userId);
    if (participant) {
      participant.isOnline = false;
    }
    // If the room is open, we can also filter out the disconnected player
    if (room.status === "open") {
      room.participants = room.participants.filter((p) => p.userId !== userId);
    }
    return room;
  });

  if (updatedRoom) {
    emitToRoom(channel, roomHash, "room_updated", updatedRoom);
    logger.info({ userId, roomHash }, "User marked as offline.");
  }

  // Set a TTL on the user's session to allow for reconnection
  await expireSession(socket.user.id);
}
