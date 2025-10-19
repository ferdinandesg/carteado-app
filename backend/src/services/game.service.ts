import { GameFactory } from "@/game/GameFactory";
import { CarteadoGame } from "@/game/CarteadoGameRules";
import { TrucoGame } from "@/game/TrucoGameRules";
import * as gameRepository from "@/lib/redis/game";
import { Card } from "shared/cards";
import { BasePlayer, GameType } from "shared/game";
import { logger } from "@/utils/logger";

type GameInstance = TrucoGame | CarteadoGame;

export async function getGameInstance<T extends GameInstance>(
  roomId: string
): Promise<T> {
  const gameData = await gameRepository.getGameState(roomId);

  if (!gameData) {
    logger.error(`Jogo não encontrado para a sala ${roomId}`);
    return;
  }

  // Data from redis is a JSON string, so it needs parsing.
  // The type from the repository is `any`, so we parse and cast.
  return GameFactory.recreate(gameData) as T;
}

export async function saveGameInstance(roomId: string, game: GameInstance) {
  await gameRepository.saveGameState(roomId, game);
}

// The generic helper
async function getAndRun<T extends GameInstance>(
  roomId: string,
  // Type guard to ensure we have the correct game type
  gameTypeGuard: (game: GameInstance) => game is T,
  action: (game: T) => void
): Promise<T> {
  const game = await getGameInstance(roomId);

  if (!gameTypeGuard(game)) {
    throw new Error(`Ação inválida para o tipo de jogo ${game.rulesName}`);
  }

  action(game);

  await saveGameInstance(roomId, game);
  return game;
}

// Type guards for the helper
function isTrucoGame(game: GameInstance): game is TrucoGame {
  return game.rulesName === "TrucoGameRules";
}

export async function createGame(gameType: GameType, players: BasePlayer[]) {
  // This function doesn't interact with a saved game, so it's different.
  return GameFactory.create(gameType, players);
}

export async function askTruco(roomId: string, userId: string) {
  return getAndRun(roomId, isTrucoGame, (game) => {
    game.rules.askTruco(game, userId);
  });
}

export async function acceptTruco(roomId: string, userId: string) {
  return getAndRun(roomId, isTrucoGame, (game) => {
    game.rules.acceptTruco(game, userId);
  });
}

export async function rejectTruco(roomId: string) {
  return getAndRun(roomId, isTrucoGame, (game) => {
    game.rules.rejectTruco(game);
  });
}

export async function playCard(roomId: string, userId: string, card: Card) {
  // This action is generic for all games
  const game = await getGameInstance(roomId);
  game.playCard(userId, card); // The base Game class has this method
  await saveGameInstance(roomId, game);
  return game;
}
