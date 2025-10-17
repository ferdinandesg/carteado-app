import { logger } from "@/utils/logger";
import { getGameState } from "@/lib/redis/game";

export async function getGameByHash(hash: string) {
  try {
    const game = await getGameState(hash);
    return game;
  } catch (error) {
    logger.error(error);
    return null;
  }
}
