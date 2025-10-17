import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { SocketContext } from "../../../@types/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import ErrorHandler from "utils/error.handler";
import { createParticipantObject } from "shared/game";
import { storeSession } from "@/lib/redis/userSession";
import { JoinRoomPayload } from "../payloads";
import { logger } from "@/utils/logger";

export async function JoinRoomEventHandler(
  context: SocketContext<JoinRoomPayload>
): Promise<void> {
  const { payload, socket, channel } = context;
  const { roomHash } = payload;
  const userId = socket.user?.id;

  logger.info({ userId, roomHash }, "User attempting to join room.");

  try {
    if (!roomHash || !socket.user) return;

    // Atomic update for joining a room
    const updatedRoom = await atomicallyUpdateRoomState(roomHash, (room) => {
      if (room.status === "playing") {
        const isPlayer = room.participants.findIndex(
          (player) => player.userId === socket.user.id
        );
        if (isPlayer === -1) {
          throw "ROOM_IS_PLAYING";
        }
        // If the player is already in the game, no state change is needed here.
        // We just need to emit the current state to them.
        return null; // Returning null signifies no update was made
      }

      if (room.participants.length >= room.size) {
        throw "ROOM_IS_FULL";
      }

      const participant = createParticipantObject(socket.user);

      room.participants.push(participant);
      socket.user.status = "not_ready";
      return room;
    });

    if (!updatedRoom) {
      return;
    }
    socket.join(roomHash);
    socket.user.room = roomHash;

    await storeSession(socket, roomHash);

    emitToRoom(channel, roomHash, "room_updated", updatedRoom);
    emitToRoom(socket, roomHash, "user_joined", {
      message: `O usuário ${socket.user.name} entrou na sala.`,
      players: { user: socket.user, isOnline: true },
    });

    logger.info({ userId, roomHash }, "User successfully joined room.");
  } catch (error) {
    logger.error({ userId, roomHash, error }, "Failed to join room.");
    ErrorHandler(error, socket);
  }
}
