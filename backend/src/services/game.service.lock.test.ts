import { BasePlayer, GameStatus, PlayerStatus } from "shared/game";

import { TrucoGame } from "@/game/TrucoGameRules";
import { acceptTruco, askTruco } from "./game.service";

const store = new Map<string, string>();
const delay = () => new Promise((resolve) => setTimeout(resolve, 5));

jest.mock("@/lib/redis/game", () => ({
  getGameState: jest.fn(async (roomHash: string) => {
    const raw = store.get(roomHash);
    await delay();
    if (!raw) throw new Error("GAME_NOT_FOUND");
    return JSON.parse(raw);
  }),
  saveGameState: jest.fn(async (roomHash: string, game: TrucoGame) => {
    await delay();
    store.set(roomHash, game.serialize());
  }),
}));

jest.mock("./rewards.service", () => ({
  applyEndOfMatchRewards: jest.fn(),
}));

jest.mock("./room.service", () => ({
  finishRoom: jest.fn(),
}));

function seedGame(roomHash: string) {
  const players = ["p1", "p2"].map((userId) => ({
    userId,
    name: userId,
    hand: [],
    playedCards: [],
    table: [],
    status: PlayerStatus.WAITING,
  })) as unknown as BasePlayer[];
  const game = new TrucoGame(players);
  game.status = GameStatus.PLAYING;
  game.manilha = "Q";
  game.playerTurn = "p1";
  store.set(roomHash, game.serialize());
}

describe("game.service room lock", () => {
  beforeEach(() => store.clear());

  it("applies concurrent actions on the same room sequentially", async () => {
    seedGame("room-lock");

    const [asked, accepted] = await Promise.all([
      askTruco("room-lock", "p1"),
      acceptTruco("room-lock", "p2"),
    ]);

    expect(asked.game.trucoState).toBe("PENDING");
    expect(accepted.game.trucoState).toBe("ACCEPTED");

    const saved = JSON.parse(store.get("room-lock")!);
    expect(saved.trucoState).toBe("ACCEPTED");
    expect(saved.currentBet).toBe(3);
  });
});
