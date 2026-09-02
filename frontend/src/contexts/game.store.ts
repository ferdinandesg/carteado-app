import { create } from "zustand";
import { BasePlayer, IGameState, PowerPrivateResult } from "shared/game";

const EMPTY_PLAYERS: BasePlayer[] = [];

/**
 * Estado do jogo recebido do servidor (`game_updated`). Ações que emitem
 * eventos ficam em `useGameActions`; o store é só estado.
 */
interface GameStore {
  game: IGameState | null;
  userId: string | null;
  /** Resultado privado do último poder (Raio-X). Só quem usou recebe. */
  powerPeek: PowerPrivateResult | null;

  setGame: (game: IGameState) => void;
  setUserId: (userId: string | null) => void;
  setPowerPeek: (peek: PowerPrivateResult | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  userId: null,
  powerPeek: null,

  setGame: (game) => set({ game }),
  setUserId: (userId) => set({ userId }),
  setPowerPeek: (powerPeek) => set({ powerPeek }),
}));

export const selectPlayers = (state: GameStore) =>
  state.game?.players || EMPTY_PLAYERS;

export const selectCurrentPlayer = (state: GameStore) => {
  const userId = state.userId;
  if (!state.game?.players || !userId) return null;
  return state.game.players.find((p) => p.userId === userId) || null;
};
