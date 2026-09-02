import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Card } from "shared/cards";

import { useSocketEmit } from "@/hooks/socket/useSocketEmit";

export type GameActions = {
  playCard: (card: Card) => void;
  handlePickCards: (cards: Card[]) => void;
  undoPlay: () => void;
  endTurn: () => void;
  pickUpBunch: () => void;
  askTruco: () => void;
  acceptTruco: () => void;
  rejectTruco: () => void;
};

const GameActionsContext = createContext<GameActions | null>(null);

export function GameActionsProvider({
  value,
  children,
}: {
  value: GameActions;
  children: ReactNode;
}) {
  return createElement(GameActionsContext.Provider, { value }, children);
}

/** Ações de jogo. No sandbox, um `GameActionsProvider` substitui o socket. */
export function useGameActions(): GameActions {
  const override = useContext(GameActionsContext);
  const emit = useSocketEmit();

  const socketActions = useMemo<GameActions>(
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

  return override ?? socketActions;
}
