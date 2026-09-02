import { Card } from "shared/cards";
import { PowerId, TRUCO_POWERS_PER_ROUND } from "shared/game";

import { stampPowersOnDeck } from "./stampDeck";

const card = (rank: string, suit: string): Card =>
  ({ rank, suit, toString: `${rank} of ${suit}` }) as unknown as Card;

describe("stampPowersOnDeck", () => {
  it("stamps at most TRUCO_POWERS_PER_ROUND unique powers on valid truco ranks", () => {
    const cards = [
      card("3", "hearts"),
      card("4", "spades"),
      card("7", "clubs"),
      card("Q", "diamonds"),
      card("K", "hearts"),
      card("A", "clubs"),
      card("2", "hearts"),
      card("J", "spades"),
      card("5", "diamonds"),
      card("8", "hearts"),
    ];

    stampPowersOnDeck(cards, Object.values(PowerId));

    const stamped = cards.filter((c) => c.powerId);
    expect(stamped).toHaveLength(TRUCO_POWERS_PER_ROUND);
    expect(new Set(stamped.map((c) => c.powerId)).size).toBe(
      TRUCO_POWERS_PER_ROUND
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
      card("A", "hearts"),
      card("2", "diamonds"),
      card("3", "clubs"),
    ];

    stampPowersOnDeck(cards, Object.values(PowerId), {
      excludeRanks: ["Q"],
    });

    expect(cards.filter((c) => c.rank === "Q").every((c) => !c.powerId)).toBe(
      true
    );
    expect(cards.filter((c) => c.powerId)).toHaveLength(TRUCO_POWERS_PER_ROUND);
  });

  it("no-ops when there are no valid cards", () => {
    const cards = [card("8", "hearts"), card("9", "spades")];
    stampPowersOnDeck(cards);
    expect(cards.every((c) => !c.powerId)).toBe(true);
  });

  it("stamps fewer than the cap when the pool is smaller", () => {
    const cards = [
      card("4", "hearts"),
      card("5", "spades"),
      card("6", "clubs"),
    ];
    stampPowersOnDeck(cards, [PowerId.X_RAY, PowerId.SILENCER]);
    expect(cards.filter((c) => c.powerId)).toHaveLength(2);
  });
});
