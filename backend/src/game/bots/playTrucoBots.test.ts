import { Card } from "shared/cards";
import { BasePlayer, GameStatus, PlayerStatus } from "shared/game";

import { TrucoGame } from "../TrucoGameRules";
import { playTrucoBots } from "./playTrucoBots";

const card = (rank: string, suit: string): Card =>
  ({ rank, suit, toString: `${rank} of ${suit}` }) as unknown as Card;

const makePlayers = (): BasePlayer[] =>
  [
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

describe("playTrucoBots", () => {
  it("plays the lowest card when it is the bot's turn", () => {
    const game = new TrucoGame(makePlayers());
    game.status = GameStatus.PLAYING;
    game.manilha = "Q";
    game.playerTurn = "bot";
    game.skipTurns("bot", 0);

    playTrucoBots(game);

    expect(game.bunch).toEqual([card("4", "spades")]);
    expect(game.getPlayer("bot")!.hand).toEqual([card("3", "hearts")]);
    expect(game.playerTurn).toBe("human");
  });

  it("accepts a pending truco on behalf of the opposing bot", () => {
    const game = new TrucoGame(makePlayers());
    game.status = GameStatus.PLAYING;
    game.playerTurn = "human";
    game.trucoState = "PENDING";
    game.trucoAskerId = "human";
    game.currentBet = 3;

    playTrucoBots(game);

    expect(game.trucoState).toBe("ACCEPTED");
  });

  it("does nothing when the current player is human", () => {
    const game = new TrucoGame(makePlayers());
    game.status = GameStatus.PLAYING;
    game.playerTurn = "human";
    game.skipTurns("human", 0);

    playTrucoBots(game);

    expect(game.bunch).toHaveLength(0);
  });
});
