import { selectCurrentPlayer, useGameStore } from "@/contexts/game.store";

export function useCurrentPlayer() {
  return useGameStore(selectCurrentPlayer);
}
