import { Namespace, Socket } from "socket.io";
import { BaseSocketContext } from "@/@types/socket";
import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import emitToRoom from "@/socket/utils/emitToRoom";
import { CHANNEL } from "@/socket/channels";
import ErrorHandler from "@/utils/error.handler";
import { socketLogger } from "@/utils/logContext";

/**
 * Remove o socket da sala atual e atualiza o estado no Redis.
 *
 * - Sala em jogo: mantém o assento (participante fica offline) para que o
 *   jogador possa voltar; remover quebraria a partida e o rejoin.
 * - Sala aberta: remove o participante e, se ele era o dono, transfere a
 *   posse para o próximo jogador registrado.
 */
export async function leaveCurrentRoom(
  socket: Socket,
  channel: Namespace
): Promise<void> {
  const roomHash = socket.user.room;
  if (!roomHash) return;

  const userId = socket.user.id;
  let leftForGood = false;

  const room = await atomicallyUpdateRoomState(roomHash, (room) => {
    const participant = room.participants.find((p) => p.userId === userId);
    if (!participant) return null;

    if (room.status === "playing") {
      participant.isOnline = false;
      return room;
    }

    room.participants = room.participants.filter((p) => p.userId !== userId);
    leftForGood = true;

    if (room.ownerId === userId) {
      const nextOwner =
        room.participants.find((p) => p.isRegistered) ?? room.participants[0];
      room.ownerId = nextOwner?.userId ?? null;
    }
    return room;
  });

  await socket.leave(roomHash);
  // `room` é tipado como string obrigatória; vazio equivale a "sem sala"
  // para todos os `requireRoom`/`if (!roomHash)` do código.
  socket.user.room = "";

  if (!room) return;

  emitToRoom(channel, roomHash, CHANNEL.SERVER.ROOM_UPDATED, room);
  if (leftForGood) {
    emitToRoom(channel, roomHash, CHANNEL.SERVER.USER_LEFT, {
      message: `O usuário ${socket.user.name} saiu da sala.`,
    });
  }
  socketLogger(socket).info({ roomHash, leftForGood }, "User left room.");
}

export async function LeaveRoomEventHandler(
  context: BaseSocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    await leaveCurrentRoom(socket, channel);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
