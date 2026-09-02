import { BaseSocketContext } from "@/@types/socket";
import prisma from "@/prisma";
import { requireRoom } from "../handleGameAction";
import { atomicallyUpdateRoomState, getRoomState } from "@/lib/redis/room";
import emitToRoom from "@/socket/utils/emitToRoom";
import ErrorHandler from "@/utils/error.handler";
import { createPlayers } from "./utils";
import { fillTrucoSeatsWithBots, PlayerStatus } from "shared/game";
import { playTrucoBots } from "@/game/bots/playTrucoBots";
import { TrucoGame } from "@/game/TrucoGameRules";
import {
  createGameFromRuleName,
  saveGameInstance,
} from "@/services/game.service";
import { CHANNEL } from "@/socket/channels";

export async function StartGameEventHandler(
  context: BaseSocketContext
): Promise<void> {
  const { socket, channel } = context;
  const { user } = socket;

  try {
    const roomHash = requireRoom(socket);
    const room = await getRoomState(roomHash);
    const participants = room?.participants ?? [];

    if (!room) {
      throw "ROOM_NOT_FOUND";
    }
    if (room.status !== "open") {
      throw "ROOM_IS_PLAYING";
    }
    if (user.id !== room.ownerId) {
      throw "ONLY_THE_OWNER_CAN_START_THE_GAME";
    }
    if (room.rule !== "CarteadoGameRules" && room.rule !== "TrucoGameRules") {
      throw "INVALID_GAME_RULE";
    }

    const isTruco = room.rule === "TrucoGameRules";
    // Truco: assentos vazios viram bots. Carteado continua exigindo mesa cheia.
    if (
      participants.length === 0 ||
      (!isTruco && participants.length < room.size)
    ) {
      throw "ROOM_IS_NOT_FULL";
    }

    const areAllParticipantsReady = participants.every(
      (p) => p.status === PlayerStatus.READY
    );
    if (!areAllParticipantsReady) {
      throw "NOT_ALL_PLAYERS_ARE_READY";
    }

    let players = await createPlayers(participants, room.id);
    if (isTruco && (room.size === 2 || room.size === 4)) {
      players = fillTrucoSeatsWithBots(players, room.size);
    }

    const game = await createGameFromRuleName(room.rule, players);
    game.startGame();
    if (game instanceof TrucoGame) {
      playTrucoBots(game);
    }

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

    const [, updatedRoom] = await Promise.all([
      updateDbPromise,
      updateRoomRedisPromise,
      saveGameRedisPromise,
    ]);

    emitToRoom(channel, roomHash, CHANNEL.SERVER.INFO, "MATCH_STARTED");
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
