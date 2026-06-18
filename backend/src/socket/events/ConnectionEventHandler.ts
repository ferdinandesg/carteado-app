import { Namespace, Socket } from "socket.io";
import { DisconnectingEventHandler } from "./DisconnectingEventHandler";
import { retrieveSession } from "@/lib/redis/userSession";
import { getRoomState } from "@/lib/redis/room";
import { logger } from "@/utils/logger";
import { registerRoomEvents } from "./rooms";
import { registerCardEvents } from "./cards";
import { registerChatEvents } from "./chat";
import emitToUser from "../utils/emitToUser";
import { getGameInstance } from "@/services/game.service";

const handleReconnection = async (socket: Socket, channel: Namespace) => {
  const session = await retrieveSession(socket.user.id);
  if (session && session.roomHash) {
    logger.info(
      { userId: socket.user.id, roomHash: session.roomHash },
      "User reconnected. Restoring session."
    );

    socket.join(session.roomHash);
    socket.user.room = session.roomHash;
    socket.user.status = session.status;

    const room = await getRoomState(session.roomHash);
    if (room) {
      const game = await getGameInstance(session.roomHash);
      if (game) {
        emitToUser(socket, "game_updated", game);
      }

      emitToUser(socket, "room_updated", room);
      socket.emit("reconnected", {
        message: "WELCOME_BACK",
        room,
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
