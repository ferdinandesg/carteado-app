import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { SocketContext } from "@/@types/socket";
import emitToRoom from "@/socket/utils/emitToRoom";
import emitToUser from "@/socket/utils/emitToUser";
import ErrorHandler from "@/utils/error.handler";
import { GameStatus, PlayerStatus, createParticipantObject } from "shared/game";
import { storeSession } from "@/lib/redis/userSession";
import { getGameInstance } from "@/services/game.service";
import { JoinRoomPayload } from "../payloads";
import { CHANNEL } from "@/socket/channels";
import { socketLogger } from "@/utils/logContext";

export async function JoinRoomEventHandler(
  context: SocketContext<JoinRoomPayload>
): Promise<void> {
  const { payload, socket, channel } = context;
  const { roomHash } = payload;
  const log = socketLogger(socket);

  log.info({ roomHash }, "User attempting to join room.");

  try {
    if (!roomHash || !socket.user) return;
    let shouldBroadcastUserJoined = false;
    let isRejoin = false;

    const updatedRoom = await atomicallyUpdateRoomState(roomHash, (room) => {
      const existingParticipant = room.participants.find(
        (player) => player.userId === socket.user.id
      );

      if (existingParticipant) {
        existingParticipant.isOnline = true;
        socket.user.status = existingParticipant.status;
        isRejoin = true;
        return room;
      }

      if (room.status === GameStatus.PLAYING) {
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
    emitToUser(socket, CHANNEL.SERVER.ROOM_JOINED, { room: updatedRoom });

    if (
      isRejoin &&
      (updatedRoom.status === GameStatus.PLAYING ||
        updatedRoom.status === GameStatus.FINISHED)
    ) {
      try {
        const game = await getGameInstance(roomHash);
        emitToUser(socket, CHANNEL.SERVER.GAME_UPDATED, game);
      } catch {
        log.warn({ roomHash }, "No game state on rejoin.");
      }
    }

    if (shouldBroadcastUserJoined) {
      emitToRoom(socket, roomHash, CHANNEL.SERVER.USER_JOINED, {
        message: `O usuário ${socket.user.name} entrou na sala.`,
      });
    }

    log.info({ roomHash, isRejoin }, "User successfully joined room.");
  } catch (error) {
    log.error({ err: error, roomHash }, "Failed to join room.");
    ErrorHandler(error, socket);
  }
}
