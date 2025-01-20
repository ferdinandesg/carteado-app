import { getGameState } from "../redis/game";

export async function getGameByHash(hash: string) {
  const game = await getGameState(hash)
  return game;
}