import { getGameState } from "../redis/game";

export async function getGameByHash(hash: string) {
  try {
    const game = await getGameState(hash);
    return game;
  } catch (_error) {
    return null;
  }
}
