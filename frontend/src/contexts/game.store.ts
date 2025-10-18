import { Card } from "shared/cards";
import { create } from "zustand";
import { Socket } from "socket.io-client";
import { BasePlayer, IGameState } from "shared/game";
const EMPTY_PLAYERS: BasePlayer[] = [];

interface GameStore {
  // Estado
  game: IGameState | null;
  socket: Socket | null;
  userId: string | null;

  // Ações que modificam o estado local
  setGame: (game: IGameState) => void;
  setSocket: (socket: Socket) => void;
  setUserId: (userId: string | null) => void;

  playCard: (card: Card) => void;
  endTurn: () => void;
  askTruco: () => void;

  pickUpBunch: () => void; // Ação que você perguntou
  undoPlay: () => void;
  handlePickCards: (cards: Card[]) => void;
  rejectTruco: () => void;
  acceptTruco: () => void;
}
export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  userId: null,
  socket: null,

  // Ações que modificam o estado
  setGame: (game) => set({ game }),
  setSocket: (socket) => set({ socket }),
  setUserId: (userId) => set({ userId }),

  // (Ações existentes)
  playCard: (card) => {
    get().socket?.emit("play_card", { card });
  },
  endTurn: () => {
    get().socket?.emit("end_turn");
  },
  askTruco: () => {
    get().socket?.emit("ask_truco");
  },

  // Implementação específica para pickUpBunch
  pickUpBunch: () => {
    const { socket } = get(); // Pega o socket do estado
    // O nome do evento no seu context original era "draw_table"
    socket?.emit("draw_table");
  },

  // Implementação para as outras, seguindo o mesmo padrão
  undoPlay: () => {
    get().socket?.emit("retrieve_card");
  },

  handlePickCards: (cards: Card[]) => {
    get().socket?.emit("pick_hand", { cards });
  },

  rejectTruco: () => {
    get().socket?.emit("reject_truco");
  },

  acceptTruco: () => {
    get().socket?.emit("accept_truco");
  },
}));

export const selectPlayers = (state: GameStore) =>
  state.game?.players || EMPTY_PLAYERS;

export const selectCurrentPlayer = (state: GameStore) => {
  const userId = state.userId;
  if (!state.game?.players || !userId) return null; // Retorno estável
  return state.game.players.find((p) => p.userId === userId) || null; // Retorno estável
};
