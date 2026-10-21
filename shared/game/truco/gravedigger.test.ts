import type { Card } from "../../cards";
import { findGravediggerCandidates } from "./gravedigger";

const card = (rank: string, suit: string): Card =>
  ({ rank, suit, toString: `${rank} of ${suit}` }) as unknown as Card;

describe("findGravediggerCandidates", () => {
  it("returns deck indexes with a truco value >= the played card", () => {
    const deck = [
      card("4", "hearts"),
      card("3", "spades"),
      card("K", "clubs"),
      card("Q", "hearts"),
      card("A", "diamonds"),
    ];
    // Manilha Q: K (44) não alcança; A (48), 3 (56) e a manilha passam.
    expect(findGravediggerCandidates(deck, card("A", "spades"), "Q")).toEqual([
      1, 3, 4,
    ]);
  });

  it("ignores ranks that are not part of the truco deck", () => {
    const deck = [
      card("8", "hearts"),
      card("10", "spades"),
      card("3", "clubs"),
    ];
    expect(findGravediggerCandidates(deck, card("4", "spades"), "Q")).toEqual([
      2,
    ]);
  });

  it("returns nothing when no card is strong enough", () => {
    const deck = [card("4", "hearts"), card("5", "spades")];
    expect(findGravediggerCandidates(deck, card("Q", "clubs"), "Q")).toEqual(
      []
    );
  });
});
