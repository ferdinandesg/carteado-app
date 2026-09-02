import { useLayoutEffect, useRef } from "react";
import { ITrucoGameState } from "shared/game";

import {
  diffTrucoSnapshots,
  type TrucoTableEvent,
} from "@/lib/game/trucoTableEvents";

/**
 * Observa o snapshot do jogo e dispara eventos de apresentação
 * (carta jogada, vaza fechada, truco pedido...) a cada `game_updated`.
 */
export function useTrucoTableEvents(
  game: ITrucoGameState | null,
  onEvents: (events: TrucoTableEvent[], next: ITrucoGameState) => void
) {
  const prevRef = useRef<ITrucoGameState | null>(null);
  const handlerRef = useRef(onEvents);

  useLayoutEffect(() => {
    handlerRef.current = onEvents;
  }, [onEvents]);

  // Layout effect: o estado visual derivado (ex.: segurar a vaza fechada no
  // centro) precisa ser aplicado antes do paint para não piscar.
  useLayoutEffect(() => {
    if (!game) {
      prevRef.current = null;
      return;
    }

    const events = diffTrucoSnapshots(prevRef.current, game);
    prevRef.current = game;

    if (events.length > 0) handlerRef.current(events, game);
  }, [game]);
}
