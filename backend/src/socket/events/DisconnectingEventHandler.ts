import { getRoomState, saveRoomState } from "src/redis/room";
import { SocketContext } from "../../@types/socket";
import emitToRoom from "@socket/utils/emitToRoom";
import { expireSession } from "src/redis/userSession";

export async function DisconnectingEventHandler(
  context: Omit<SocketContext, "payload">
): Promise<void> {
  const { socket, channel } = context;
  const roomHash = socket.user.room;

  if (!roomHash) return;
  const room = await getRoomState(roomHash);
  if (!room) return;
  if (room.status === "open") {
    room.participants = room.participants.filter(
      (participant) => participant.userId !== socket.user.id
    );
    await saveRoomState(roomHash, room);
    emitToRoom(channel, roomHash, "room_update", room);
  }
  // Quando o usuário desconecta, damos um tempo para ele voltar
  await expireSession(socket.user.id);
  console.log(`Disconnected: ${socket.user.id}`);
}
