import { useGameStore } from "@/contexts/game.store";
import { useSyncExternalStore } from "react";
import { IGameState } from "shared/game";

// Hook genérico e robusto
export function useTypedGame<T extends IGameState>(
  typeGuard: (game: IGameState | null) => game is T
): T | null {
  const subscribe = useGameStore.subscribe;

  const getSnapshot = () => {
    const game = useGameStore.getState().game;
    console.log({
      game,
    });
    // Retorna o jogo apenas se ele for do tipo correto, senão null
    return typeGuard(game) ? game : null;
  };

  // O hook garante que o componente só re-renderiza quando o valor retornado por getSnapshot muda.
  return useSyncExternalStore(subscribe, getSnapshot);
}
