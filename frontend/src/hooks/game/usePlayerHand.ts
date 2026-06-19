import { useMemo } from "react";
import { Card } from "shared/cards";

import { useCurrentPlayer } from "./useCurrentPlayer";

export function usePlayerHand(): Card[] {
  const player = useCurrentPlayer();

  return useMemo(
    () => [...(player?.hand ?? [])].sort((a, b) => a.value - b.value),
    [player?.hand]
  );
}
