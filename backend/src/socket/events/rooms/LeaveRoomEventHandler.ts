import { getRoom } from "@/services/room.service";
import { SocketContext } from "../../../@types/socket";
import { saveRoomState } from "@/lib/redis/room";
import emitToRoom from "@/socket/utils/emitToRoom";

export async function LeaveRoomEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const room = await getRoom(socket.user.room);
  if (!room) return;
  room.participants = room.participants.filter(
    (player) => player.userId !== socket.user.id
  );
  await saveRoomState(room.hash, room);
  emitToRoom(channel, room.hash, "room_updated", room);
  channel.to(socket.user.room).emit("quit", JSON.stringify(socket.user));
}
