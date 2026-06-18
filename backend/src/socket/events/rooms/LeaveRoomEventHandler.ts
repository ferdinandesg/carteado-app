import { SocketContext } from "@/@types/socket";
import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import emitToRoom from "@/socket/utils/emitToRoom";
import { clearSession } from "@/lib/redis/userSession";
import { CHANNEL } from "@/socket/channels";

export async function LeaveRoomEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const roomHash = socket.user.room;
  if (!roomHash) return;

  const room = await atomicallyUpdateRoomState(roomHash, (room) => {
    room.participants = room.participants.filter(
      (player) => player.userId !== socket.user.id
    );
    return room;
  });

  if (!room) return;
  await clearSession(socket.user.id);
  emitToRoom(channel, roomHash, CHANNEL.SERVER.ROOM_UPDATED, room);
  channel
    .to(roomHash)
    .emit(CHANNEL.CLIENT.LEAVE_ROOM, JSON.stringify(socket.user));
}
