import { Card } from "shared/cards";
import { BasePlayer, GameStatus, PlayerStatus, PowerId } from "shared/game";

import { TrucoGame } from "../TrucoGameRules";
import { needsTrucoBotAction, playTrucoBots } from "./playTrucoBots";

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

  it("fires a stamped card power when the bot plays that card", () => {
    const players = makePlayers();
    const stamped = card("4", "spades");
    stamped.powerId = PowerId.CHANGE_TRUMP;
    players[1].hand = [stamped];

    const game = new TrucoGame(players);
    game.status = GameStatus.PLAYING;
    game.manilha = "Q";
    game.vira = card("7", "clubs");
    game.playerTurn = "bot";
    game.skipTurns("bot", 0);
    game.deck.cards = [card("A", "spades")];

    playTrucoBots(game);

    expect(game.manilha).toBe("2");
    expect(game.powerUsages).toEqual([
      expect.objectContaining({
        powerId: PowerId.CHANGE_TRUMP,
        userId: "bot",
        trigger: "CARD",
      }),
    ]);
  });

  it("reports when a bot still has to act", () => {
    const game = new TrucoGame(makePlayers());
    game.status = GameStatus.PLAYING;
    game.playerTurn = "bot";
    expect(needsTrucoBotAction(game)).toBe(true);

    game.playerTurn = "human";
    expect(needsTrucoBotAction(game)).toBe(false);

    game.trucoState = "PENDING";
    game.trucoAskerId = "human";
    expect(needsTrucoBotAction(game)).toBe(true);
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
