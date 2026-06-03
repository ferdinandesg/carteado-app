import { Namespace, Socket } from "socket.io";
import { DisconnectingEventHandler } from "./DisconnectingEventHandler";
import { retrieveSession } from "@/lib/redis/userSession";
import { logger } from "@/utils/logger";
import { registerRoomEvents } from "./rooms";
import { registerCardEvents } from "./cards";
import { registerChatEvents } from "./chat";
import emitToRoom from "../utils/emitToRoom";
import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { createParticipantObject } from "shared/game";
import { getGameInstance } from "@/services/game.service";

const handleReconnection = async (socket: Socket, channel: Namespace) => {
  const session = await retrieveSession(socket.user.id);
  if (session && session.roomHash) {
    logger.info(
      { userId: socket.user.id, roomHash: session.roomHash },
      "User reconnected. Restoring session."
    );

    const updatedRoom = await atomicallyUpdateRoomState(
      session.roomHash,
      (room) => {
        const participant = room.participants.find(
          (p) => p.userId === socket.user.id
        );
        if (participant) {
          participant.isOnline = true;
        } else {
          const created = createParticipantObject(socket.user);
          room.participants.push(created);
        }
        return room;
      }
    );

    if (updatedRoom) {
      socket.join(session.roomHash);
      socket.user.room = session.roomHash;
      socket.user.status = session.status;
      const game = await getGameInstance(session.roomHash);
      emitToRoom(channel, session.roomHash, "game_updated", game);

      emitToRoom(channel, session.roomHash, "room_updated", updatedRoom);
      socket.emit("reconnected", {
        message: "WELCOME_BACK",
        room: updatedRoom,
      });
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

  socket.on("disconnecting", () =>
    DisconnectingEventHandler({ socket, channel })
  );
  await handleReconnection(socket, channel);
}
