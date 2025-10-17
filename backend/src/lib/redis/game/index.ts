import { GameFactory } from "game/GameFactory";
import RedisClass from "../client";
import { TrucoGame } from "game/TrucoGameRules";
import { CarteadoGame } from "game/CarteadoGameRules";
import { logger } from "@/utils/logger";

export async function saveGameState(
  roomHash: string,
  game: TrucoGame | CarteadoGame
) {
  const redis = await RedisClass.getDataClient();
  const serializedGame = game.serialize();
  await redis.set(`game:${roomHash}`, serializedGame, {
    EX: 7200,
  });
}

export async function getGameState(
  roomHash: string
): Promise<TrucoGame | CarteadoGame> {
  const redis = await RedisClass.getDataClient();
  const serializedGame = await redis.get(`game:${roomHash}`);
  if (serializedGame) {
    const game = GameFactory.deserialize(String(serializedGame));
    return game;
  }
  logger.error("GAME_NOT_FOUND");
}
