import { act } from "@testing-library/react";
import { useGameStore, selectPlayers, selectCurrentPlayer } from "./game.store";
import { User } from "shared/types";
import { IGameState, PlayerStatus } from "shared/game";

const mockGameState = {
  players: [
    {
      userId: "user-1",
      name: "Ferdinandes",
      hand: [],
      status: PlayerStatus.PLAYING,
      id: "player-1",
      user: { id: "user-1", name: "Ferdinandes" } as User,
    },
    {
      userId: "user-2",
      name: "Visitante",
      hand: [],
      status: PlayerStatus.PLAYING,
      id: "player-2",
      user: { id: "user-2", name: "Visitante" } as User,
    },
  ],
  bunch: [],
  hand: [],
  rounds: 0,
  playerTurn: "user-1",
  winner: null,
} as unknown as IGameState;

describe("useGameStore", () => {
  beforeEach(() => {
    act(() => {
      useGameStore.setState({ game: null, userId: null });
    });
  });

  describe("State Setters", () => {
    it("deve ter o estado inicial correto", () => {
      const { game, userId } = useGameStore.getState();
      expect(game).toBeNull();
      expect(userId).toBeNull();
    });

    it("deve atualizar o estado do jogo com setGame", () => {
      act(() => {
        useGameStore.getState().setGame(mockGameState);
      });

      expect(useGameStore.getState().game).toEqual(mockGameState);
    });

    it("deve atualizar o userId com setUserId", () => {
      act(() => {
        useGameStore.getState().setUserId("user-123");
      });

      expect(useGameStore.getState().userId).toBe("user-123");
    });
  });

  describe("Selectors", () => {
    it("selectPlayers deve retornar um array vazio se o jogo for nulo", () => {
      const players = selectPlayers(useGameStore.getState());
      expect(players).toEqual([]);
    });

    it("selectPlayers deve retornar a mesma referência vazia entre chamadas", () => {
      const first = selectPlayers(useGameStore.getState());
      const second = selectPlayers(useGameStore.getState());
      expect(first).toBe(second);
    });

    it("selectPlayers deve retornar os jogadores do estado do jogo", () => {
      act(() => {
        useGameStore.getState().setGame(mockGameState);
      });
      const players = selectPlayers(useGameStore.getState());
      expect(players).toHaveLength(2);
      expect(players[0].name).toBe("Ferdinandes");
    });

    it("selectCurrentPlayer deve retornar nulo se não houver jogo ou userId", () => {
      let player = selectCurrentPlayer(useGameStore.getState());
      expect(player).toBeNull();

      act(() => useGameStore.getState().setGame(mockGameState));
      player = selectCurrentPlayer(useGameStore.getState());
      expect(player).toBeNull();
    });

    it("selectCurrentPlayer deve encontrar e retornar o jogador correto", () => {
      act(() => {
        useGameStore.getState().setGame(mockGameState);
        useGameStore.getState().setUserId("user-2");
      });

      const player = selectCurrentPlayer(useGameStore.getState());
      expect(player).not.toBeNull();
      expect(player?.name).toBe("Visitante");
    });

    it("selectCurrentPlayer deve retornar nulo se o userId não corresponder a nenhum jogador", () => {
      act(() => {
        useGameStore.getState().setGame(mockGameState);
        useGameStore.getState().setUserId("user-nao-existe");
      });

      const player = selectCurrentPlayer(useGameStore.getState());
      expect(player).toBeNull();
    });
  });
});
