import type { Namespace } from "socket.io";
import { Card } from "shared/cards";
import {
  BasePlayer,
  GameStatus,
  PlayerStatus,
  TRUCO_BOT_DELAY_MS,
} from "shared/game";

import { TrucoGame } from "../TrucoGameRules";
import {
  clearTrucoBotSchedule,
  queueTrucoBotsIfNeeded,
} from "./scheduleTrucoBots";

const card = (rank: string, suit: string): Card =>
  ({ rank, suit, toString: `${rank} of ${suit}` }) as unknown as Card;

const gameRef: { current: TrucoGame | null } = { current: null };

jest.mock("@/services/game.service", () => ({
  getGameInstance: jest.fn(async () => gameRef.current),
  saveGameInstance: jest.fn(),
}));

jest.mock("@/services/rewards.service", () => ({
  applyEndOfMatchRewards: jest.fn(),
}));

jest.mock("@/services/room.service", () => ({
  finishRoom: jest.fn(),
}));

jest.mock("@/socket/utils/emitToRoom", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/socket/utils/emitGameToRoom", () => ({
  emitGameToRoom: jest.fn(),
}));

function makeGame(): TrucoGame {
  const players = [
    {
      userId: "human",
      name: "human",
      hand: [card("K", "hearts")],
      playedCards: [],
      table: [],
      status: PlayerStatus.PLAYING,
      isBot: false,
    },
    {
      userId: "bot",
      name: "bot",
      hand: [card("4", "spades"), card("3", "hearts")],
      playedCards: [],
      table: [],
      status: PlayerStatus.WAITING,
      isBot: true,
    },
  ] as unknown as BasePlayer[];
  const game = new TrucoGame(players);
  game.status = GameStatus.PLAYING;
  game.manilha = "Q";
  game.playerTurn = "bot";
  game.skipTurns("bot", 0);
  return game;
}

describe("scheduleTrucoBots", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    gameRef.current = makeGame();
  });

  afterEach(() => {
    clearTrucoBotSchedule("room");
    jest.useRealTimers();
  });

  it("waits before the bot plays and then persists the step", async () => {
    const game = gameRef.current!;
    queueTrucoBotsIfNeeded(game, "room", {} as Namespace);

    expect(game.bunch).toHaveLength(0);

    await jest.advanceTimersByTimeAsync(TRUCO_BOT_DELAY_MS - 1);
    expect(game.bunch).toHaveLength(0);

    await jest.advanceTimersByTimeAsync(1);
    expect(game.bunch).toEqual([card("4", "spades")]);
    expect(game.playerTurn).toBe("human");
  });
});
