import { SocketContext } from "../../../@types/socket";

export async function JoinRoomEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { payload, socket } = context;
    const { roomId } = payload;
    socket.join(roomId);
    socket.user.room = roomId;
    
    socket.broadcast.to(roomId).emit(
      "user_joined",
      JSON.stringify({
        message: `O usuário ${socket.user?.name} entrou na partida.`,
        player: { user: socket.user, isOnline: true },
      })
    );
  } catch (er) {
    console.log(er);
  }
}
