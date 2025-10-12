import { act } from "@testing-library/react";
import { useGameStore, selectPlayers, selectCurrentPlayer } from "./game.store";
import { GameState, Player, User } from "shared/types";
import { Card } from "shared/cards";
import { Socket } from "socket.io-client";
import { PlayerStatus } from "shared/game";

// Criamos um mock do objeto socket com uma função 'emit' que podemos espionar
const mockSocket = {
  emit: jest.fn(),
} as unknown as Socket;

// Dados de exemplo para os testes
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
} as unknown as GameState;

describe("useGameStore", () => {
  // Antes de cada teste, resetamos o estado do store e limpamos o mock do socket
  beforeEach(() => {
    act(() => {
      // Reseta para o estado inicial que definimos no store
      useGameStore.setState({
        game: null,
        userId: null,
        socket: null,
      });
    });
    jest.clearAllMocks(); // Limpa chamadas anteriores do mockSocket.emit
  });

  // 1. Testes para as ações que modificam o estado diretamente (Setters)
  describe("State Setters", () => {
    it("deve ter o estado inicial correto", () => {
      const { game, userId, socket } = useGameStore.getState();
      expect(game).toBeNull();
      expect(userId).toBeNull();
      expect(socket).toBeNull();
    });

    it("deve atualizar o estado do jogo com setGame", () => {
      act(() => {
        useGameStore.getState().setGame(mockGameState);
      });

      const { game } = useGameStore.getState();
      expect(game).toEqual(mockGameState);
    });

    it("deve atualizar o userId com setUserId", () => {
      act(() => {
        useGameStore.getState().setUserId("user-123");
      });

      expect(useGameStore.getState().userId).toBe("user-123");
    });

    it("deve atualizar o socket com setSocket", () => {
      act(() => {
        useGameStore.getState().setSocket(mockSocket);
      });

      expect(useGameStore.getState().socket).toBe(mockSocket);
    });
  });

  // 2. Testes para as ações que emitem eventos via Socket
  describe("Socket Emitting Actions", () => {
    // Antes de cada teste neste grupo, garantimos que o mock do socket está no estado
    beforeEach(() => {
      act(() => {
        useGameStore.getState().setSocket(mockSocket);
      });
    });

    it('deve emitir o evento "play_card" com a carta correta ao chamar playCard', () => {
      const card = { suit: "clubs", value: 13 } as Card;
      act(() => {
        useGameStore.getState().playCard(card);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("play_card", { card });
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    });

    it('deve emitir o evento "end_turn" ao chamar endTurn', () => {
      act(() => {
        useGameStore.getState().endTurn();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("end_turn");
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    });

    it('deve emitir o evento "ask_truco" ao chamar askTruco', () => {
      act(() => {
        useGameStore.getState().askTruco();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("ask_truco");
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    });

    it('deve emitir o evento "draw_table" ao chamar pickUpBunch', () => {
      act(() => {
        useGameStore.getState().pickUpBunch();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("draw_table");
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    });

    it('deve emitir o evento "pick_hand" com as cartas corretas ao chamar handlePickCards', () => {
      const cards = [
        { suit: "hearts", value: 10 },
        { suit: "spades", value: 7 },
      ] as Card[];
      act(() => {
        useGameStore.getState().handlePickCards(cards);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("pick_hand", { cards });
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    });
  });

  // 3. Testes para os seletores que derivam dados do estado
  describe("Selectors", () => {
    it("selectPlayers deve retornar um array vazio se o jogo for nulo", () => {
      const players = selectPlayers(useGameStore.getState());
      expect(players).toEqual([]);
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
