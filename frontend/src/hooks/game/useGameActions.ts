import { useMemo } from "react";
import type { Card } from "shared/cards";

import { useSocketEmit } from "@/hooks/socket/useSocketEmit";

/** Ações de jogo (Carteado e Truco) que o cliente emite para o servidor. */
export function useGameActions() {
  const emit = useSocketEmit();

  return useMemo(
    () => ({
      playCard: (card: Card) => emit("play_card", { card }),
      handlePickCards: (cards: Card[]) => emit("pick_hand", { cards }),
      undoPlay: () => emit("retrieve_card"),
      endTurn: () => emit("end_turn"),
      pickUpBunch: () => emit("draw_table"),
      askTruco: () => emit("ask_truco"),
      acceptTruco: () => emit("accept_truco"),
      rejectTruco: () => emit("reject_truco"),
    }),
    [emit]
  );
}
