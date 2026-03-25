import { GameFactory } from "game/GameFactory";
import RedisClass from "@/lib/redis/client";
import { TrucoGame } from "game/TrucoGameRules";
import { CarteadoGame } from "game/CarteadoGameRules";
import { logger } from "@/utils/logger";
import { ICarteadoGameState, ITrucoGameState } from "shared/game";
import { REDIS_KEYS, REDIS_TTL } from "@/config/redis";

export async function saveGameState(
  roomHash: string,
  game: TrucoGame | CarteadoGame
) {
  const redis = await RedisClass.getDataClient();
  const serializedGame = game.serialize();
  await redis.set(REDIS_KEYS.game(roomHash), serializedGame, {
    EX: REDIS_TTL.game,
  });
}

export async function getGameState(
  roomHash: string
): Promise<ITrucoGameState | ICarteadoGameState> {
  const redis = await RedisClass.getDataClient();
  const serializedGame = await redis.get(REDIS_KEYS.game(roomHash));
  if (serializedGame) {
    const game = GameFactory.deserialize(String(serializedGame));
    return game;
  }
  logger.error("GAME_NOT_FOUND");
  throw new Error("GAME_NOT_FOUND");
}
