import { Card } from "shared/cards";
import { PlayerStatus } from "./base.player";
import { chooseTrucoBotCard, fillTrucoSeatsWithBots } from "./trucoBot";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({
  rank,
  suit,
  value: 1,
  secondaryValue: null,
  toString: `${rank} of ${suit}`,
});

describe("chooseTrucoBotCard", () => {
  it("returns the lowest card by manilha value", () => {
    const hand = [card("3", "hearts"), card("4", "spades"), card("Q", "clubs")];
    expect(chooseTrucoBotCard(hand, "Q")).toEqual(card("4", "spades"));
  });

  it("returns the highest card when asked", () => {
    const hand = [card("3", "hearts"), card("4", "spades"), card("Q", "clubs")];
    expect(chooseTrucoBotCard(hand, "Q", "highest")).toEqual(
      card("Q", "clubs")
    );
  });

  it("returns null for an empty hand", () => {
    expect(chooseTrucoBotCard([], "Q")).toBeNull();
  });
});

describe("fillTrucoSeatsWithBots", () => {
  it("fills remaining seats and marks them as bots", () => {
    const filled = fillTrucoSeatsWithBots(
      [
        {
          userId: "you",
          name: "you",
          status: PlayerStatus.WAITING,
          hand: [],
          playedCards: [],
          table: [],
          teamId: "",
        },
      ],
      2
    );
    expect(filled).toHaveLength(2);
    expect(filled[0].userId).toBe("you");
    expect(filled[1].isBot).toBe(true);
  });
});
