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
  children?: ReactNode;
}) {
  return createElement(GameActionsContext.Provider, { value }, children);
}

/** Ações que viram eventos no socket da sala. */
export function useSocketGameActions(): GameActions {
  const emit = useSocketEmit();

  return useMemo<GameActions>(
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

/** Provider padrão da sala: ações via socket. O sandbox injeta as suas. */
export function SocketGameActionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const actions = useSocketGameActions();
  return createElement(
    GameActionsContext.Provider,
    { value: actions },
    children
  );
}

/** Ações de jogo do provider mais próximo (sala = socket, sandbox = local). */
export function useGameActions(): GameActions {
  const actions = useContext(GameActionsContext);
  if (!actions) {
    throw new Error("useGameActions must be used within a GameActionsProvider");
  }
  return actions;
}
