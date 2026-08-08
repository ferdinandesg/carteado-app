// Integração frontend <-> backend: o GameController recebe payloads REAIS de
// `game_updated` (fixture gerada pela serialização do backend, validada pelo
// teste de contrato em backend/src/tests/gameStateContract.test.ts) e o teste
// verifica que o store e os hooks de jogo interpretam esses estados.

import fs from "node:fs";
import path from "node:path";
import { act, render, renderHook } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { IGameState, PlayerStatus, GameStatus } from "shared/game";

import { GameController } from "./game.controller";
import { useGameStore, selectCurrentPlayer } from "./game.store";
import { useTrucoActionsState } from "@/hooks/game/useTrucoActionsState";

type Handler = (payload: unknown) => void;

class FakeSocket {
  private handlers = new Map<string, Set<Handler>>();
  emit = jest.fn();

  on = (event: string, handler: Handler) => {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return this;
  };

  off = (event: string, handler: Handler) => {
    this.handlers.get(event)?.delete(handler);
    return this;
  };

  /** Simula o servidor emitindo um evento para este cliente. */
  serverEmit(event: string, payload: unknown) {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }
}

let mockSocketInstance: FakeSocket;

jest.mock("@/contexts/socket.context", () => ({
  useSocket: () => ({ socket: mockSocketInstance, isConnected: true }),
}));

const fixtures = JSON.parse(
  fs.readFileSync(
    path.resolve(
      __dirname,
      "../../../shared/testFixtures/gameStatePayloads.json"
    ),
    "utf-8"
  )
) as {
  carteado: Record<string, IGameState>;
  truco: Record<string, IGameState>;
};

const USER_A = "user-a";
const USER_B = "user-b";

const setSessionUser = (id: string) => {
  (useSession as jest.Mock).mockReturnValue({
    data: { user: { id, name: id } },
    status: "authenticated",
  });
};

const receiveGameUpdate = (payload: IGameState) => {
  act(() => {
    mockSocketInstance.serverEmit("game_updated", payload);
  });
};

describe("GameController — integração com payloads reais do backend", () => {
  beforeEach(() => {
    mockSocketInstance = new FakeSocket();
    act(() => {
      useGameStore.setState({ game: null, userId: null, socket: null });
    });
  });

  it("acompanha uma partida de CARTEADO do deal à vitória", () => {
    setSessionUser(USER_A);
    render(<GameController />);

    // Deal inicial: 9 cartas e fase de escolha
    receiveGameUpdate(fixtures.carteado.choosing);
    let me = selectCurrentPlayer(useGameStore.getState())!;
    expect(me).not.toBeNull();
    expect(me.status).toBe(PlayerStatus.CHOOSING);
    expect(me.hand).toHaveLength(9);

    // Todos escolheram: jogador da vez liberado
    receiveGameUpdate(fixtures.carteado.handsPicked);
    me = selectCurrentPlayer(useGameStore.getState())!;
    expect(me.status).toBe(PlayerStatus.PLAYING);
    expect(me.hand).toHaveLength(3);
    expect(useGameStore.getState().game?.playerTurn).toBe(USER_A);

    // Meio de jogo: mesa visível virou a mão, monte acumulado
    receiveGameUpdate(fixtures.carteado.midgame);
    me = selectCurrentPlayer(useGameStore.getState())!;
    expect(me.hand.map((c) => c.rank)).toEqual(["5", "5", "5"]);
    expect(useGameStore.getState().game?.bunch).toHaveLength(6);

    // Fim de partida: vencedor identificável pelo playerTurn
    receiveGameUpdate(fixtures.carteado.finished);
    const game = useGameStore.getState().game!;
    expect(game.status).toBe(GameStatus.FINISHED);
    expect(game.playerTurn).toBe(USER_A);
    me = selectCurrentPlayer(useGameStore.getState())!;
    expect(me.hand).toHaveLength(0);
    expect(me.table).toHaveLength(0);
  });

  it("habilita as ações de TRUCO corretas para o time desafiado", () => {
    setSessionUser(USER_B);
    render(<GameController />);

    receiveGameUpdate(fixtures.truco.roundStart);
    const { result } = renderHook(() => useTrucoActionsState());
    expect(result.current.canAskTruco).toBe(true);
    expect(result.current.canAcceptReject).toBe(false);

    // user-a pediu truco: user-b (time adversário) pode aceitar/fugir
    receiveGameUpdate(fixtures.truco.trucoPending);
    expect(result.current.canAcceptReject).toBe(true);
    expect(result.current.canAskTruco).toBe(false);

    // Truco aceito: dá para retrucar, não dá mais para aceitar
    receiveGameUpdate(fixtures.truco.trucoAccepted);
    expect(result.current.canAcceptReject).toBe(false);
    expect(result.current.canAskTruco).toBe(true);
  });

  it("reflete o placar do TRUCO após rodada fechada valendo 3", () => {
    setSessionUser(USER_A);
    render(<GameController />);

    receiveGameUpdate(fixtures.truco.roundScored);
    const game = useGameStore.getState().game as IGameState & {
      teams: { id: string; score: number }[];
      currentBet: number;
      trucoState: string;
    };

    expect(game.teams[0].score).toBe(3);
    expect(game.teams[1].score).toBe(0);
    expect(game.currentBet).toBe(1); // nova rodada
    expect(game.trucoState).toBe("NONE");
    const me = selectCurrentPlayer(useGameStore.getState())!;
    expect(me.hand).toHaveLength(3);
  });
});
