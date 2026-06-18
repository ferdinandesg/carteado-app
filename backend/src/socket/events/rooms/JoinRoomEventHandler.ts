import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { SocketContext } from "@/@types/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import ErrorHandler from "@/utils/error.handler";
import { PlayerStatus, createParticipantObject } from "shared/game";
import { storeSession } from "@/lib/redis/userSession";
import { JoinRoomPayload } from "../payloads";
import { logger } from "@/utils/logger";
import { CHANNEL } from "@/socket/channels";

export async function JoinRoomEventHandler(
  context: SocketContext<JoinRoomPayload>
): Promise<void> {
  const { payload, socket, channel } = context;
  const { roomHash } = payload;
  const userId = socket.user?.id;

  logger.info({ userId, roomHash }, "User attempting to join room.");

  try {
    if (!roomHash || !socket.user) return;
    let shouldBroadcastUserJoined = false;

    // Atomic update for joining a room
    const updatedRoom = await atomicallyUpdateRoomState(roomHash, (room) => {
      const existingParticipant = room.participants.find(
        (player) => player.userId === socket.user.id
      );

      if (existingParticipant) {
        existingParticipant.isOnline = true;
        socket.user.status = existingParticipant.status;
        return room;
      }

      if (room.status === "playing") {
        throw "ROOM_IS_PLAYING";
      }

      if (room.participants.length >= room.size) {
        throw "ROOM_IS_FULL";
      }

      const participant = createParticipantObject(socket.user);
      room.participants.push(participant);
      socket.user.status = PlayerStatus.NOT_READY;
      shouldBroadcastUserJoined = true;
      return room;
    });

    if (!updatedRoom) {
      return;
    }
    await socket.join(roomHash);
    socket.user.room = roomHash;

    await storeSession(socket, roomHash);

    emitToRoom(channel, roomHash, CHANNEL.SERVER.ROOM_UPDATED, updatedRoom);
    if (shouldBroadcastUserJoined) {
      emitToRoom(socket, roomHash, CHANNEL.SERVER.USER_JOINED, {
        message: `O usuário ${socket.user.name} entrou na sala.`,
        players: { user: socket.user, isOnline: true },
      });
    }

    logger.info({ userId, roomHash }, "User successfully joined room.");
  } catch (error) {
    logger.error({ userId, roomHash, error }, "Failed to join room.");
    ErrorHandler(error, socket);
  }
}
