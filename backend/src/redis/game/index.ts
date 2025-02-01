import GameClass from "../../game/game";
import RedisClass from "../client";

export async function saveGameState(roomHash: string, game: GameClass) {
  const redis = await RedisClass.getDataClient();
  const serializedGame = game.serialize();
  await redis.set(`game:${roomHash}`, serializedGame, {
    EX: 7200,
  });
}

export async function getGameState(roomHash: string): Promise<GameClass> {
  const redis = await RedisClass.getDataClient();
  const serializedGame = await redis.get(`game:${roomHash}`);
  if (serializedGame) {
    return GameClass.deserialize(serializedGame);
  }
  throw "Partida não encontrada";
}
