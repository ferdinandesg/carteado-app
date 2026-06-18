import { SocketContext } from "@/@types/socket";
import prisma from "@/prisma";
import { atomicallyUpdateRoomState, getRoomState } from "@/lib/redis/room";
import emitToRoom from "@/socket/utils/emitToRoom";
import ErrorHandler from "@/utils/error.handler";
import { createPlayers } from "./utils";
import { Participant } from "shared/types";
import { PlayerStatus } from "shared/game";
import {
  createGameFromRuleName,
  saveGameInstance,
} from "@/services/game.service";
import { CHANNEL } from "@/socket/channels";

export async function StartGameEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const { user } = socket;

  if (!user?.room) return;
  const roomHash = user.room;

  try {
    // --- 1. BUSCAR DADOS DE FONTES DIFERENTES ---
    const room = await getRoomState(roomHash);
    // Buscamos os participantes do nosso gerenciador em memória, não do socket.io
    const participants: Participant[] = room?.participants || [];

    if (!room) {
      throw "ROOM_NOT_FOUND";
    }
    if (room.status !== "open") {
      throw "ROOM_IS_PLAYING";
    }
    if (user.id !== room.ownerId) {
      throw "ONLY_THE_OWNER_CAN_START_THE_GAME";
    }
    if (participants.length < room.size) {
      throw "ROOM_IS_NOT_FULL";
    }

    // A verificação de status agora usa nossa lista de participantes
    const areAllParticipantsReady = participants.every(
      (p) => p.status === PlayerStatus.READY
    );
    if (!areAllParticipantsReady) {
      throw "NOT_ALL_PLAYERS_ARE_READY";
    }

    const players = await createPlayers(participants, room.id);

    if (room.rule !== "CarteadoGameRules" && room.rule !== "TrucoGameRules") {
      throw "INVALID_GAME_RULE";
    }

    const game = await createGameFromRuleName(room.rule, players);
    game.startGame(); // Prepara o estado inicial do jogo (dar cartas, etc.)

    // Preparamos as atualizações de estado
    const updateDbPromise = prisma.room.update({
      where: { id: room.id },
      data: { status: "playing" },
    });

    const updateRoomRedisPromise = atomicallyUpdateRoomState(
      roomHash,
      (currentRoom) => {
        currentRoom.status = "playing";
        return currentRoom;
      }
    );
    const saveGameRedisPromise = saveGameInstance(roomHash, game);

    // Executamos todas as promessas de atualização de estado juntas
    const [, updatedRoom] = await Promise.all([
      updateDbPromise,
      updateRoomRedisPromise,
      saveGameRedisPromise,
    ]);

    emitToRoom(channel, roomHash, CHANNEL.SERVER.INFO, "MATCH_STARTED");
    // Enviamos o estado inicial completo do jogo e da sala
    emitToRoom(channel, roomHash, CHANNEL.SERVER.GAME_UPDATED, game);
    emitToRoom(
      channel,
      roomHash,
      CHANNEL.SERVER.ROOM_UPDATED,
      updatedRoom ?? room
    );
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
