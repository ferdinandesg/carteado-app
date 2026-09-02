import { GameFactory } from "@/game/GameFactory";
import { CarteadoGame } from "@/game/CarteadoGameRules";
import { TrucoGame } from "@/game/TrucoGameRules";
import * as gameRepository from "@/lib/redis/game";
import { RoomWithParticipants } from "@/lib/redis/room";
import { Card } from "shared/cards";
import {
  BasePlayer,
  GameRuleNames,
  GameStatus,
  GameType,
  PowerPrivateResult,
  UsePowerPayload,
} from "shared/game";
import { logger } from "@/utils/logger";
import { GameError } from "@/errors/GameError";
import { applyEndOfMatchRewards } from "./rewards.service";
import { finishRoom } from "./room.service";

type GameInstance = TrucoGame | CarteadoGame;

/**
 * Resultado de toda ação de jogo. `room` só vem preenchida quando a ação
 * encerrou a partida (sala transicionou para "finished"); `privateResult`
 * é informação destinada apenas a quem executou a ação.
 */
export interface GameActionResult<T extends GameInstance = GameInstance> {
  game: T;
  room: RoomWithParticipants | null;
  privateResult?: PowerPrivateResult;
}

export async function getGameInstance<T extends GameInstance>(
  roomId: string
): Promise<T> {
  const gameData = await gameRepository.getGameState(roomId);

  if (!gameData) {
    logger.error({ roomHash: roomId }, "Game not found.");
    throw new GameError({
      code: "GAME_NOT_FOUND",
      message: "GAME_NOT_FOUND",
      meta: { roomId },
    });
  }

  // Data from redis is a JSON string, so it needs parsing.
  // The type from the repository is `any`, so we parse and cast.
  return GameFactory.recreate(gameData) as T;
}

export async function saveGameInstance(roomId: string, game: GameInstance) {
  await gameRepository.saveGameState(roomId, game);
}

/**
 * Caminho único de toda ação de jogo: carrega → valida o tipo → aplica →
 * recompensas → persiste → finaliza a sala se a partida terminou.
 */
async function getAndRun<T extends GameInstance>(
  roomId: string,
  gameTypeGuard: (game: GameInstance) => game is T,
  action: (game: T) => void
): Promise<GameActionResult<T>> {
  const game = await getGameInstance(roomId);

  if (!gameTypeGuard(game)) {
    throw new GameError({
      code: "INVALID_ACTION",
      message: "INVALID_ACTION",
      meta: { rulesName: game.rulesName },
    });
  }

  action(game);

  let privateResult: PowerPrivateResult | undefined;
  if (isTrucoGame(game)) {
    privateResult = game.pendingPrivateResult;
    game.pendingPrivateResult = undefined;
  }

  await applyEndOfMatchRewards(game);
  await saveGameInstance(roomId, game);

  const room =
    game.status === GameStatus.FINISHED ? await finishRoom(roomId) : null;

  return { game, room, privateResult };
}

// Type guards for the helper
function isTrucoGame(game: GameInstance): game is TrucoGame {
  return game.rulesName === "TrucoGameRules";
}

function isCarteadoGame(game: GameInstance): game is CarteadoGame {
  return game.rulesName === "CarteadoGameRules";
}

function isAnyGame(game: GameInstance): game is GameInstance {
  return Boolean(game);
}

export async function createGame(gameType: GameType, players: BasePlayer[]) {
  // This function doesn't interact with a saved game, so it's different.
  return GameFactory.create(gameType, players);
}

export async function createGameFromRuleName(
  rule: GameRuleNames,
  players: BasePlayer[]
) {
  const gameType =
    rule === "TrucoGameRules" ? GameType.TRUCO : GameType.CARTEADO;
  return createGame(gameType, players);
}

// ---- Ações genéricas ------------------------------------------------------

export function playCard(roomId: string, userId: string, card: Card) {
  return getAndRun(roomId, isAnyGame, (game) => game.playCard(userId, card));
}

export function endTurn(roomId: string, userId: string) {
  return getAndRun(roomId, isAnyGame, (game) => game.endTurn(userId));
}

// ---- Truco ----------------------------------------------------------------

export function askTruco(roomId: string, userId: string) {
  return getAndRun(roomId, isTrucoGame, (game) =>
    game.rules.askTruco(game, userId)
  );
}

export function acceptTruco(roomId: string, userId: string) {
  return getAndRun(roomId, isTrucoGame, (game) =>
    game.rules.acceptTruco(game, userId)
  );
}

export function rejectTruco(roomId: string) {
  return getAndRun(roomId, isTrucoGame, (game) => game.rules.rejectTruco(game));
}

export async function usePower(
  roomId: string,
  userId: string,
  payload: UsePowerPayload
): Promise<GameActionResult<TrucoGame>> {
  return getAndRun(roomId, isTrucoGame, (game) => {
    game.rules.usePower(game, userId, payload);
  });
}

// ---- Carteado -------------------------------------------------------------

export function pickHand(roomId: string, userId: string, cards: Card[]) {
  return getAndRun(roomId, isCarteadoGame, (game) =>
    game.rules.pickHand(game, userId, cards)
  );
}

export function pickUpBunch(roomId: string, userId: string) {
  return getAndRun(roomId, isCarteadoGame, (game) =>
    game.rules.pickUpBunch(game, userId)
  );
}

export function undoPlay(roomId: string, userId: string) {
  return getAndRun(roomId, isCarteadoGame, (game) =>
    game.rules.undoPlay(game, userId)
  );
}
