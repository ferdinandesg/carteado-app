import { Namespace, Socket } from "socket.io";
import { DisconnectingEventHandler } from "./DisconnectingEventHandler";
import { clearSession, retrieveSession } from "@/lib/redis/userSession";
import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { logger } from "@/utils/logger";
import { registerRoomEvents } from "./rooms";
import { registerCardEvents } from "./cards";
import { registerChatEvents } from "./chat";
import emitToUser from "../utils/emitToUser";
import { getGameInstance } from "@/services/game.service";
import ErrorHandler from "@/utils/error.handler";
import { registerSafeSocketEvent } from "./registerSafeSocketEvent";
import { CHANNEL } from "@/socket/channels";

const handleReconnection = async (socket: Socket) => {
  const session = await retrieveSession(socket.user.id);
  if (session && session.roomHash) {
    logger.info(
      { userId: socket.user.id, roomHash: session.roomHash },
      "User reconnected. Restoring session."
    );

    let restoredParticipant = false;
    const room = await atomicallyUpdateRoomState(session.roomHash, (room) => {
      const participant = room.participants.find(
        (p) => p.userId === socket.user.id
      );
      if (!participant) {
        return null;
      }

      participant.isOnline = true;
      socket.user.status = participant.status;
      restoredParticipant = true;
      return room;
    });
    if (room && restoredParticipant) {
      await socket.join(session.roomHash);
      socket.user.room = session.roomHash;

      const game = await getGameInstance(session.roomHash);
      if (game) {
        emitToUser(socket, CHANNEL.SERVER.GAME_UPDATED, game);
      }

      emitToUser(socket, CHANNEL.SERVER.ROOM_UPDATED, room);
      socket.emit(CHANNEL.SERVER.RECONNECTED, {
        message: "WELCOME_BACK",
        room,
      });
    } else {
      logger.warn(
        { userId: socket.user.id, roomHash: session.roomHash },
        "Discarding stale session without room participant."
      );
      await clearSession(socket.user.id);
    }
  } else {
    logger.info({ userId: socket.user.id }, "New user connected.");
  }
};

export async function ConnectionEventHandler(
  socket: Socket,
  channel: Namespace
): Promise<void> {
  registerRoomEvents(socket, channel);
  registerCardEvents(socket, channel);
  registerChatEvents(socket, channel);

  registerSafeSocketEvent(socket, CHANNEL.SERVER.DISCONNECTING, () =>
    DisconnectingEventHandler({ socket, channel })
  );
  try {
    await handleReconnection(socket);
  } catch (error) {
    try {
      ErrorHandler(error, socket);
    } catch (unhandledError) {
      logger.error(
        { error: unhandledError },
        "Unhandled socket connection error."
      );
    }
  }
}
