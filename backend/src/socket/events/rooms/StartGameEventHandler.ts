import { SocketContext } from "../../../@types/socket";
import prisma from "../../../prisma";
import { saveGameState } from "../../../redis/game";
import { getRoomState, saveRoomState } from "../../../redis/room";
import emitToRoom from "@socket/utils/emitToRoom";
import ErrorHandler from "src/utils/error.handler";
import { createPlayers } from "./utils";
import { CarteadoGame } from "src/game/CarteadoGameRules";
import { TrucoGame } from "src/game/TrucoGameRules";
import { Participant } from "shared/types";
import { PlayerStatus, TrucoPlayer } from "shared/game";

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

    let game: CarteadoGame | TrucoGame;
    if (room.rule === "CarteadoGameRules") {
      game = new CarteadoGame(players);
    } else {
      game = new TrucoGame(players as TrucoPlayer[]);
    }

    game.startGame(); // Prepara o estado inicial do jogo (dar cartas, etc.)

    // Preparamos as atualizações de estado
    const updateDbPromise = prisma.room.update({
      where: { id: room.id },
      data: { status: "playing" },
    });

    // Atualizamos o objeto da sala para salvar no Redis
    room.status = "playing";
    const updateRoomRedisPromise = saveRoomState(roomHash, room);
    const saveGameRedisPromise = saveGameState(roomHash, game);

    // Executamos todas as promessas de atualização de estado juntas
    await Promise.all([
      updateDbPromise,
      updateRoomRedisPromise,
      saveGameRedisPromise,
    ]);

    emitToRoom(channel, roomHash, "info", "MATCH_STARTED");
    // Enviamos o estado inicial completo do jogo e da sala
    emitToRoom(channel, roomHash, "game_updated", game);
    emitToRoom(channel, roomHash, "room_updated", room);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
