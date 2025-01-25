import GameClass from "../../game/game";
import RedisClass from "../client";

export async function saveGameState(roomId: string, game: GameClass) {
  const redis = await RedisClass.getInstance();
  const serializedGame = game.serialize();
  await redis.set(`game:${roomId}`, serializedGame, {
    EX: 3600,
  });
}

export async function getGameState(roomId: string): Promise<GameClass> {
  const redis = await RedisClass.getInstance();
  const serializedGame = await redis.get(`game:${roomId}`);
  if (serializedGame) {
    return GameClass.deserialize(serializedGame);
  }
  throw "Partida não encontrada";
}
