import { useMemo } from "react";
import { BasePlayer, IGameState } from "shared/game";

import { useGameStore } from "@/contexts/game.store";

type TablePlayersState = {
  mainPlayer: BasePlayer | null;
  orderedOpponents: BasePlayer[];
};

export function useTablePlayers(game: IGameState | null): TablePlayersState {
  const userId = useGameStore((state) => state.userId);

  return useMemo(() => {
    if (!game || !userId) {
      return { mainPlayer: null, orderedOpponents: [] };
    }

    const mainPlayerIndex = game.players.findIndex(
      (player) => player.userId === userId
    );

    if (mainPlayerIndex === -1) {
      return { mainPlayer: null, orderedOpponents: [] };
    }

    const mainPlayer = game.players[mainPlayerIndex];
    const orderedOpponents: BasePlayer[] = [];

    for (let i = 1; i < game.players.length; i++) {
      const opponentIndex = (mainPlayerIndex + i) % game.players.length;
      orderedOpponents.push(game.players[opponentIndex]);
    }

    return { mainPlayer, orderedOpponents };
  }, [game, userId]);
}
