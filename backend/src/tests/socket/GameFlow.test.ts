// Integração via socket: partidas inteiras dirigidas pelos eventos reais
// (start_game, pick_hand, play_card, end_turn, ask/accept/reject_truco),
// passando por handlers, game.service e persistência (mock em memória
// com a mesma semântica serialize/deserialize do Redis).

import { Socket } from "socket.io-client";
import { socketTestSetup } from "./socket.setup";
import { closeSockets, createTestSocket, waitForEvent } from "./utils";
import { CarteadoGame } from "@/game/CarteadoGameRules";
import { TrucoGame } from "@/game/TrucoGameRules";
import {
  card,
  forceHidden,
  installSeededRandom,
  makePlayers,
  rigDeck,
} from "@/tests/helpers/gameTestHarness";
import { Card } from "shared/cards";
import { BasePlayer, GameStatus, PlayerStatus } from "shared/game";

const USER_A = "userA-valid-token";
const USER_B = "userB-valid-token";
const ROOM = "room-test";

// Estado em memória compartilhado com as factories dos mocks (referenciado
// apenas em tempo de execução, por isso o prefixo `mock`).
const mockRoomState: { room: Record<string, unknown> | null } = { room: null };
const mockGameStore: { data: string | null } = { data: null };

jest.mock("@/lib/redis/room", () => ({
  getRoomState: jest.fn(async () => mockRoomState.room),
  saveRoomState: jest.fn(),
  atomicallyUpdateRoomState: jest.fn(
    async (
      _roomHash: string,
      updateFn: (room: unknown) => Record<string, unknown> | null
    ) => {
      const result = updateFn(mockRoomState.room);
      if (result) mockRoomState.room = result;
      return mockRoomState.room;
    }
  ),
}));

// Mesma semântica do repositório real: guarda o serialize() e devolve o parse.
jest.mock("@/lib/redis/game", () => ({
  saveGameState: jest.fn(
    async (_hash: string, game: { serialize(): string }) => {
      mockGameStore.data = game.serialize();
    }
  ),
  getGameState: jest.fn(async () => {
    if (!mockGameStore.data) throw new Error("GAME_NOT_FOUND");
    return JSON.parse(mockGameStore.data);
  }),
}));

jest.mock("@/socket/events/rooms/utils", () => ({
  createPlayers: jest.fn(
    async (participants: { userId: string; name: string }[]) =>
      participants.map((p) => ({
        userId: p.userId,
        name: p.name,
        status: "waiting",
        hand: [],
        table: [],
        playedCards: [],
        teamId: "",
      }))
  ),
}));

jest.mock("@/prisma", () => ({
  __esModule: true,
  default: { room: { update: jest.fn().mockResolvedValue({}) } },
}));

jest.setTimeout(20000);

type SerializedGame = {
  status: string;
  playerTurn: string;
  bunch: Card[];
  players: BasePlayer[];
  trucoState?: string;
  currentBet?: number;
  teams?: { id: string; score: number; roundWins: number }[];
  rounds?: number;
};

describe("Fluxo de jogo via socket — integração", () => {
  const { getPort } = socketTestSetup();
  let socketA: Socket;
  let socketB: Socket;

  const freshRoom = (rule: string) => ({
    id: "room-db-id",
    hash: ROOM,
    status: "open",
    size: 2,
    rule,
    ownerId: USER_A,
    spectators: [],
    participants: [],
  });

  /** Emite um evento e espera o próximo game_updated broadcast na sala. */
  const emitAndWaitGame = (
    socket: Socket,
    event: string,
    payload?: unknown
  ): Promise<SerializedGame> => {
    const next = waitForEvent<SerializedGame>(socketA, "game_updated");
    socket.emit(event, payload);
    return next;
  };

  const getPlayerFrom = (game: SerializedGame, userId: string) =>
    game.players.find((p) => p.userId === userId)!;

  const connectAndPrepareRoom = async () => {
    const port = getPort();
    socketA = createTestSocket(USER_A, port);
    socketB = createTestSocket(USER_B, port);
    await waitForEvent<void>(socketA, "connect");
    await waitForEvent<void>(socketB, "connect");

    const joinedA = waitForEvent(socketA, "room_joined");
    socketA.emit("join_room", { roomHash: ROOM });
    await joinedA;
    const joinedB = waitForEvent(socketB, "room_joined");
    socketB.emit("join_room", { roomHash: ROOM });
    await joinedB;

    const readyA = waitForEvent(socketA, "room_updated");
    socketA.emit("set_player_status", { status: PlayerStatus.READY });
    await readyA;
    const readyB = waitForEvent(socketB, "room_updated");
    socketB.emit("set_player_status", { status: PlayerStatus.READY });
    await readyB;
  };

  afterEach(() => {
    closeSockets(socketA, socketB);
    jest.restoreAllMocks();
  });

  describe("CARTEADO", () => {
    beforeEach(() => {
      mockRoomState.room = freshRoom("CarteadoGameRules");
      mockGameStore.data = null;
    });

    // Fixtures da partida (mesmo roteiro determinístico dos testes de domínio)
    const makeFixtures = () => ({
      aHand: [card("3", "hearts"), card("3", "spades"), card("3", "diamonds")],
      aVisible: [
        card("5", "hearts"),
        card("5", "spades"),
        card("5", "diamonds"),
      ],
      aHidden: [card("A", "hearts"), card("2", "hearts"), card("10", "hearts")],
      bHand: [card("4", "hearts"), card("4", "spades"), card("4", "diamonds")],
      bVisible: [
        card("6", "hearts"),
        card("6", "spades"),
        card("6", "diamonds"),
      ],
      bHidden: [card("A", "spades"), card("K", "spades"), card("Q", "spades")],
    });

    /**
     * Substitui o estado salvo pós-start_game por um deal determinístico,
     * como se o Redis tivesse esse estado (mesma serialização real).
     */
    const seedDeterministicGame = (f: ReturnType<typeof makeFixtures>) => {
      const spy = installSeededRandom();
      const game = new CarteadoGame(makePlayers([USER_A, USER_B]));
      rigDeck(game.deck, [
        ...f.aHand,
        ...f.aVisible,
        ...f.aHidden,
        ...f.bHand,
        ...f.bVisible,
        ...f.bHidden,
      ]);
      game.startGame();
      game.playerTurn = USER_A;
      forceHidden(game.getPlayer(USER_A)!, f.aHidden);
      forceHidden(game.getPlayer(USER_B)!, f.bHidden);
      spy.mockRestore();
      mockGameStore.data = game.serialize();
    };

    it("deve jogar uma partida completa do start_game até a vitória", async () => {
      await connectAndPrepareRoom();

      // start_game real: deal de 9 cartas, todos CHOOSING
      const started = await emitAndWaitGame(socketA, "start_game");
      expect(started.status).toBe(GameStatus.PLAYING);
      expect(started.players).toHaveLength(2);
      for (const p of started.players) {
        expect(p.status).toBe(PlayerStatus.CHOOSING);
        expect(p.hand).toHaveLength(9);
      }

      // Torna o estado persistido determinístico e segue o fluxo pelos eventos
      const f = makeFixtures();
      seedDeterministicGame(f);

      let game = await emitAndWaitGame(socketA, "pick_hand", {
        cards: f.aHand,
      });
      expect(getPlayerFrom(game, USER_A).status).toBe(PlayerStatus.WAITING);

      game = await emitAndWaitGame(socketB, "pick_hand", { cards: f.bHand });
      expect(getPlayerFrom(game, USER_A).status).toBe(PlayerStatus.PLAYING);
      expect(game.playerTurn).toBe(USER_A);

      // Fora da vez: B tenta jogar e recebe erro, estado não muda
      const errorOnB = waitForEvent<string>(socketB, "error").catch((e) => e);
      socketB.emit("play_card", { card: f.bHand[0] });
      expect(await errorOnB).toBe("NOT_YOUR_TURN");

      const playTurn = async (socket: Socket, cards: Card[]) => {
        for (const c of cards) {
          game = await emitAndWaitGame(socket, "play_card", { card: c });
        }
        game = await emitAndWaitGame(socket, "end_turn", {});
      };

      // Turno 1 — A joga os 3s; deck vazio faz as visíveis virarem a mão
      await playTurn(socketA, f.aHand);
      expect(getPlayerFrom(game, USER_A).hand.map((c) => c.rank)).toEqual([
        "5",
        "5",
        "5",
      ]);
      expect(game.playerTurn).toBe(USER_B);

      // Turno 2 — B joga os 4s
      await playTurn(socketB, f.bHand);
      expect(getPlayerFrom(game, USER_B).hand.map((c) => c.rank)).toEqual([
        "6",
        "6",
        "6",
      ]);

      // Turnos 3 e 4 — cartas visíveis da mesa
      await playTurn(socketA, f.aVisible);
      expect(getPlayerFrom(game, USER_A).hand).toHaveLength(0);
      await playTurn(socketB, f.bVisible);

      // Cartas ocultas no fim do jogo
      await playTurn(socketA, [card("A", "hearts", true)]);
      await playTurn(socketB, [card("A", "spades", true)]);

      // O 2 pula o adversário: com 2 jogadores, volta para A
      await playTurn(socketA, [card("2", "hearts", true)]);
      expect(game.playerTurn).toBe(USER_A);

      // Última oculta: o 10 queima o monte e fecha a partida
      await playTurn(socketA, [card("10", "hearts", true)]);
      expect(game.status).toBe(GameStatus.FINISHED);
      expect(game.playerTurn).toBe(USER_A); // vencedor
      expect(game.bunch).toHaveLength(0);
      expect(getPlayerFrom(game, USER_B).table).toHaveLength(2);
    });
  });

  describe("TRUCO", () => {
    beforeEach(() => {
      mockRoomState.room = freshRoom("TrucoGameRules");
      mockGameStore.data = null;
    });

    /** Estado determinístico: manilha Q, mãos fixas, vez do userA. */
    const seedDeterministicTruco = () => {
      const game = new TrucoGame(makePlayers([USER_A, USER_B]));
      game.startGame();
      game.vira = card("7", "clubs");
      game.manilha = "Q";
      game.playerTurn = USER_A;
      game.getPlayer(USER_A)!.hand = [
        card("K", "hearts"),
        card("A", "hearts"),
        card("4", "diamonds"),
      ];
      game.getPlayer(USER_B)!.hand = [
        card("J", "spades"),
        card("J", "diamonds"),
        card("5", "clubs"),
      ];
      mockGameStore.data = game.serialize();
    };

    it("deve resolver truco aceito, rodada vencida e fuga via eventos", async () => {
      await connectAndPrepareRoom();

      const started = await emitAndWaitGame(socketA, "start_game");
      expect(started.teams).toHaveLength(2);
      for (const p of started.players) {
        expect(p.hand).toHaveLength(3);
      }

      seedDeterministicTruco();

      // A pede truco: aposta sobe para 3 e fica pendente
      let game = await emitAndWaitGame(socketA, "ask_truco");
      expect(game.trucoState).toBe("PENDING");
      expect(game.currentBet).toBe(3);

      // Com truco pendente, jogar carta é rejeitado
      const errorOnA = waitForEvent<string>(socketA, "error").catch((e) => e);
      socketA.emit("play_card", { card: card("K", "hearts") });
      expect(await errorOnA).toBe("Invalid action");

      game = await emitAndWaitGame(socketB, "accept_truco");
      expect(game.trucoState).toBe("ACCEPTED");

      // A vence as duas mãos e leva a rodada valendo 3
      await emitAndWaitGame(socketA, "play_card", {
        card: card("K", "hearts"),
      });
      game = await emitAndWaitGame(socketB, "play_card", {
        card: card("J", "spades"),
      });
      expect(game.teams![0].roundWins).toBe(1);

      await emitAndWaitGame(socketA, "play_card", {
        card: card("A", "hearts"),
      });
      game = await emitAndWaitGame(socketB, "play_card", {
        card: card("J", "diamonds"),
      });

      expect(game.teams![0].score).toBe(3);
      expect(game.currentBet).toBe(1); // nova rodada distribuída
      expect(game.trucoState).toBe("NONE");
      expect(game.players.every((p) => p.hand.length === 3)).toBe(true);

      // Nova rodada: B pede truco e A foge — time de B ganha 1 ponto
      game = await emitAndWaitGame(socketB, "ask_truco");
      expect(game.trucoState).toBe("PENDING");

      game = await emitAndWaitGame(socketA, "reject_truco");
      expect(game.teams![1].score).toBe(1);
      expect(game.teams![0].score).toBe(3);
      expect(game.status).toBe(GameStatus.PLAYING);
    });
  });
});
