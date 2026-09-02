import { Card } from "shared/cards";
import { GameStatus, PowerId } from "shared/game";

import {
  acceptSandboxTruco,
  askSandboxTruco,
  createSandboxTrucoGame,
  pickRandomHandCard,
  playSandboxCard,
  rejectSandboxTruco,
  SANDBOX_BOT_ID,
  SANDBOX_YOU_ID,
  makeSandboxCard,
} from "./trucoSandboxGame";

function withHands(you: Card[], bot: Card[], manilha = "Q") {
  const game = createSandboxTrucoGame({ you: "Você", bot: "Bot" });
  return {
    ...game,
    manilha,
    bunch: [],
    playerTurn: SANDBOX_YOU_ID,
    players: game.players.map((player) => ({
      ...player,
      hand: player.userId === SANDBOX_YOU_ID ? you : bot,
      playedCards: [],
    })),
  };
}

describe("trucoSandboxGame", () => {
  it("passes the turn to the bot after you play", () => {
    const game = withHands(
      [makeSandboxCard("4", "hearts")],
      [makeSandboxCard("3", "spades")]
    );

    const { game: next } = playSandboxCard(
      game,
      SANDBOX_YOU_ID,
      makeSandboxCard("4", "hearts")
    );

    expect(next.playerTurn).toBe(SANDBOX_BOT_ID);
    expect(next.bunch).toHaveLength(1);
    expect(
      next.players.find((p) => p.userId === SANDBOX_YOU_ID)?.hand
    ).toHaveLength(0);
  });

  it("resolves the trick when the bot answers", () => {
    const { game: afterYou } = playSandboxCard(
      withHands(
        [makeSandboxCard("3", "hearts")],
        [makeSandboxCard("4", "spades")]
      ),
      SANDBOX_YOU_ID,
      makeSandboxCard("3", "hearts")
    );

    const { game: next } = playSandboxCard(
      afterYou,
      SANDBOX_BOT_ID,
      makeSandboxCard("4", "spades")
    );

    expect(next.bunch).toHaveLength(0);
    expect(next.handsResults).toHaveLength(1);
    expect(next.playerTurn).toBe(SANDBOX_YOU_ID);
    expect(next.status).toBe(GameStatus.PLAYING);
  });

  it("asks truco and lets the other player accept", () => {
    const asked = askSandboxTruco(
      withHands(
        [makeSandboxCard("4", "hearts")],
        [makeSandboxCard("3", "spades")]
      ),
      SANDBOX_YOU_ID
    );

    expect(asked.trucoState).toBe("PENDING");
    expect(asked.currentBet).toBe(3);

    const accepted = acceptSandboxTruco(asked, SANDBOX_BOT_ID);
    expect(accepted.trucoState).toBe("ACCEPTED");
  });

  it("picks a card from the hand at random", () => {
    const hand = [
      makeSandboxCard("4", "hearts"),
      makeSandboxCard("7", "clubs"),
    ];
    jest.spyOn(Math, "random").mockReturnValue(0.9);
    expect(pickRandomHandCard(hand)).toEqual(hand[1]);
    jest.restoreAllMocks();
  });

  it("swaps the played GRAVEDIGGER card with a remaining deck card of equal or greater value", () => {
    const played = makeSandboxCard("4", "hearts", PowerId.GRAVEDIGGER);
    const kept = makeSandboxCard("7", "clubs");
    const fromDeck = makeSandboxCard("A", "spades");
    const game = {
      ...withHands([played, kept], [makeSandboxCard("3", "spades")]),
      deck: {
        cards: [fromDeck],
        numberOfFullDecks: 1,
      } as unknown as ReturnType<typeof withHands>["deck"],
    };

    const { game: next } = playSandboxCard(game, SANDBOX_YOU_ID, played);

    const you = next.players.find(
      (player) => player.userId === SANDBOX_YOU_ID
    )!;
    expect(next.bunch).toEqual([
      expect.objectContaining({ rank: "A", suit: "spades" }),
    ]);
    expect(you.hand).toEqual([
      expect.objectContaining({ rank: "7", suit: "clubs" }),
    ]);
    expect(you.playedCards).toEqual([
      expect.objectContaining({ rank: "A", suit: "spades" }),
    ]);
    expect(next.deck.cards).toEqual([
      expect.objectContaining({ rank: "4", suit: "hearts" }),
    ]);
    expect(next.powerUsages).toEqual([
      expect.objectContaining({
        powerId: PowerId.GRAVEDIGGER,
        userId: SANDBOX_YOU_ID,
        returnedCard: expect.objectContaining({ rank: "4", suit: "hearts" }),
        replacementCard: expect.objectContaining({ rank: "A", suit: "spades" }),
      }),
    ]);
  });

  it("peeks a random opponent card when X_RAY is stamped", () => {
    const played = makeSandboxCard("4", "hearts", PowerId.X_RAY);
    const botCard = makeSandboxCard("3", "spades");
    const game = withHands([played], [botCard]);

    jest.spyOn(Math, "random").mockReturnValue(0);
    const { game: next, privateResult } = playSandboxCard(
      game,
      SANDBOX_YOU_ID,
      played
    );
    jest.restoreAllMocks();

    expect(privateResult).toEqual({
      powerId: PowerId.X_RAY,
      targetUserId: SANDBOX_BOT_ID,
      card: expect.objectContaining({ rank: "3", suit: "spades" }),
    });
    expect(next.powerUsages).toEqual([
      expect.objectContaining({
        powerId: PowerId.X_RAY,
        userId: SANDBOX_YOU_ID,
        targetUserId: SANDBOX_BOT_ID,
      }),
    ]);
  });

  it("reports whether the opponent holds a manilha when SIXTH_SENSE is stamped", () => {
    const played = makeSandboxCard("4", "hearts", PowerId.SIXTH_SENSE);
    const game = withHands([played], [makeSandboxCard("Q", "clubs")]);

    const { privateResult } = playSandboxCard(game, SANDBOX_YOU_ID, played);

    expect(privateResult).toEqual({
      powerId: PowerId.SIXTH_SENSE,
      targetUserId: SANDBOX_BOT_ID,
      hasManilha: true,
    });
  });

  it("disguises the played ILLUSIONIST card as zap until the trick resolves", () => {
    const played = makeSandboxCard("4", "hearts", PowerId.ILLUSIONIST);
    const { game: afterYou } = playSandboxCard(
      withHands([played], [makeSandboxCard("5", "spades")]),
      SANDBOX_YOU_ID,
      played
    );

    expect(afterYou.bunch[0]).toEqual(
      expect.objectContaining({
        rank: "Q",
        suit: "clubs",
        illusionReal: expect.objectContaining({ rank: "4", suit: "hearts" }),
      })
    );

    const { game: next } = playSandboxCard(
      afterYou,
      SANDBOX_BOT_ID,
      makeSandboxCard("5", "spades")
    );

    expect(next.handsResults[0].bunch[0]).toEqual(
      expect.objectContaining({ rank: "4", suit: "hearts" })
    );
    expect(next.handsResults[0].winnerTeamId).toBe("TEAM_B");
  });

  it("makes reject cost 1 after SILVER_SHIELD is armed, even on a raised bet", () => {
    const played = makeSandboxCard("4", "hearts", PowerId.SILVER_SHIELD);
    const { game: armed } = playSandboxCard(
      withHands([played], [makeSandboxCard("3", "spades")]),
      SANDBOX_YOU_ID,
      played
    );

    const asked = askSandboxTruco(armed, SANDBOX_YOU_ID);
    const accepted = acceptSandboxTruco(asked, SANDBOX_BOT_ID);
    const raised = askSandboxTruco(accepted, SANDBOX_BOT_ID);
    expect(raised.currentBet).toBe(6);

    const rejected = rejectSandboxTruco(raised);
    const botTeam = rejected.teams.find((team) => team.id === "TEAM_B")!;
    expect(botTeam.score).toBe(1);
  });
});
