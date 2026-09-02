import { Card } from "shared/cards";
import { PowerId } from "shared/game";

import { stampPowersOnDeck } from "./stampDeck";

const card = (rank: string, suit: string): Card =>
  ({ rank, suit, toString: `${rank} of ${suit}` }) as unknown as Card;

describe("stampPowersOnDeck", () => {
  it("stamps each power once on valid truco ranks", () => {
    const cards = [
      card("3", "hearts"),
      card("4", "spades"),
      card("7", "clubs"),
      card("Q", "diamonds"),
      card("K", "hearts"),
      card("8", "hearts"),
    ];

    stampPowersOnDeck(cards, Object.values(PowerId));

    const stamped = cards.filter((c) => c.powerId);
    expect(stamped).toHaveLength(Object.values(PowerId).length);
    expect(stamped.map((c) => c.powerId).sort()).toEqual(
      Object.values(PowerId).slice().sort()
    );
    expect(cards.find((c) => c.rank === "8")?.powerId).toBeUndefined();
  });

  it("skips excluded ranks (manilha)", () => {
    const cards = [
      card("Q", "hearts"),
      card("Q", "spades"),
      card("4", "clubs"),
      card("5", "diamonds"),
      card("6", "hearts"),
      card("7", "spades"),
      card("K", "clubs"),
    ];

    stampPowersOnDeck(cards, Object.values(PowerId), {
      excludeRanks: ["Q"],
    });

    expect(cards.filter((c) => c.rank === "Q").every((c) => !c.powerId)).toBe(
      true
    );
    expect(cards.filter((c) => c.powerId)).toHaveLength(
      Object.values(PowerId).length
    );
  });

  it("no-ops when there are no valid cards", () => {
    const cards = [card("8", "hearts"), card("9", "spades")];
    stampPowersOnDeck(cards);
    expect(cards.every((c) => !c.powerId)).toBe(true);
  });
});
