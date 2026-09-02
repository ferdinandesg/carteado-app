import { Socket } from "socket.io";
import { ZodType } from "zod";
import { BaseSocketContext } from "@/@types/socket";
import { GameError } from "@/errors/GameError";
import { GameActionResult } from "@/services/game.service";
import { CHANNEL } from "@/socket/channels";
import emitToRoom from "@/socket/utils/emitToRoom";
import emitToUser from "@/socket/utils/emitToUser";
import ErrorHandler from "@/utils/error.handler";
import { queueTrucoBotsIfNeeded } from "@/game/bots/scheduleTrucoBots";

/** Sala atual do socket; erro padronizado quando o usuário não está em nenhuma. */
export function requireRoom(socket: Socket): string {
  const roomHash = socket.user?.room;
  if (!roomHash) {
    throw new GameError({
      code: "PLAYER_NOT_IN_ROOM",
      message: "USER_NOT_IN_ROOM",
    });
  }
  return roomHash;
}

/** Valida o payload vindo do cliente; falha vira erro de domínio (não 500). */
export function parsePayload<T>(schema: ZodType<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new GameError({
      code: "VALIDATION",
      message: "INVALID_PAYLOAD",
      meta: { issues: parsed.error.issues },
    });
  }
  return parsed.data;
}

/**
 * Fluxo único de todo evento que altera a partida: resolve a sala, executa a
 * ação no game.service, faz broadcast do estado e, quando a partida termina,
 * também da sala. Erros de domínio voltam ao emissor via `error`.
 */
export async function handleGameAction(
  context: BaseSocketContext,
  action: (roomHash: string, userId: string) => Promise<GameActionResult>
): Promise<void> {
  const { socket, channel } = context;
  try {
    const roomHash = requireRoom(socket);
    const { game, room, privateResult } = await action(
      roomHash,
      socket.user.id
    );

    emitToRoom(channel, roomHash, CHANNEL.SERVER.GAME_UPDATED, game);
    if (room) {
      emitToRoom(channel, roomHash, CHANNEL.SERVER.ROOM_UPDATED, room);
    }
    if (privateResult) {
      emitToUser(socket, CHANNEL.SERVER.POWER_RESULT, privateResult);
    }
    queueTrucoBotsIfNeeded(game, roomHash, channel);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
