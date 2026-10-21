import { ALL_RANKS, ALL_SUITS, RANK_TO_VALUE } from "./constants";
import Deck from "./deck";
import { makeCard } from "./factory";
import type { Card, Rank, Suit } from "./types";

// Cópia da construção que existia em Deck, gameTestHarness e makeSandboxCard.
function legacyCard(rank: Rank, suit: Suit): Card {
  const value = RANK_TO_VALUE[rank];
  return {
    suit,
    rank,
    value: Array.isArray(value) ? value[0] : value,
    secondaryValue: Array.isArray(value) ? value[1] : null,
    toString: `${rank} of ${suit}`,
  };
}

describe("makeCard", () => {
  it("matches the legacy shape for every rank and suit", () => {
    for (const suit of ALL_SUITS) {
      for (const rank of ALL_RANKS) {
        expect(makeCard(rank, suit)).toStrictEqual(legacyCard(rank, suit));
      }
    }
  });

  it("serializes exactly like the cards the Deck stores in Redis", () => {
    const deckCards = new Deck().getCards();
    for (const card of deckCards) {
      expect(JSON.stringify(makeCard(card.rank, card.suit))).toBe(
        JSON.stringify(card)
      );
    }
  });

  it("gives the ace both values", () => {
    expect(makeCard("A", "spades")).toMatchObject({
      value: 14,
      secondaryValue: 1,
      toString: "A of spades",
    });
  });

  it("applies extras (hidden, power)", () => {
    expect(
      makeCard("4", "hearts", { isHidden: true, powerId: "x_ray" })
    ).toEqual({
      ...legacyCard("4", "hearts"),
      isHidden: true,
      powerId: "x_ray",
    });
  });
});
