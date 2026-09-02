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

    stampPowersOnDeck(cards, Object.values(PowerId), { chance: 1 });

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
      chance: 1,
    });

    expect(cards.filter((c) => c.rank === "Q").every((c) => !c.powerId)).toBe(
      true
    );
    expect(cards.filter((c) => c.powerId)).toHaveLength(TRUCO_POWERS_PER_ROUND);
  });

  it("no-ops when there are no valid cards", () => {
    const cards = [card("8", "hearts"), card("9", "spades")];
    stampPowersOnDeck(cards, Object.values(PowerId), { chance: 1 });
    expect(cards.every((c) => !c.powerId)).toBe(true);
  });

  it("stamps fewer than the cap when the pool is smaller", () => {
    const cards = [
      card("4", "hearts"),
      card("5", "spades"),
      card("6", "clubs"),
    ];
    stampPowersOnDeck(cards, [PowerId.X_RAY, PowerId.SILENCER], { chance: 1 });
    expect(cards.filter((c) => c.powerId)).toHaveLength(2);
  });

  it("gives each card an independent chance and never exceeds the cap", () => {
    const cards = [
      card("4", "hearts"),
      card("5", "spades"),
      card("6", "clubs"),
      card("7", "diamonds"),
      card("Q", "hearts"),
      card("K", "spades"),
    ];
    const rolls = [0.99, 0.05, 0.2, 0.01, 0.5, 0.02];
    let index = 0;

    stampPowersOnDeck(cards, Object.values(PowerId), {
      chance: 0.1,
      random: () => rolls[index++] ?? 1,
    });

    const stamped = cards.filter((c) => c.powerId);
    expect(stamped.length).toBeLessThanOrEqual(TRUCO_POWERS_PER_ROUND);
    expect(stamped).toHaveLength(3);
  });

  it("stamps no powers when every roll misses", () => {
    const cards = [
      card("4", "hearts"),
      card("5", "spades"),
      card("6", "clubs"),
    ];
    stampPowersOnDeck(cards, Object.values(PowerId), { random: () => 0.5 });
    expect(cards.every((c) => !c.powerId)).toBe(true);
  });
});
