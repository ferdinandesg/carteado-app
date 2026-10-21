import { RANK_TO_VALUE } from "./constants";
import type { Card, Rank, Suit, Value } from "./types";

export type CardExtras = Partial<Pick<Card, "isHidden" | "powerId">>;

/** `value`/`secondaryValue` de um rank (o Ás vale 14 e 1). */
export function cardValues(rank: Rank): {
  value: Value;
  secondaryValue: Value | null;
} {
  const value = RANK_TO_VALUE[rank];
  return Array.isArray(value)
    ? { value: value[0], secondaryValue: value[1] }
    : { value, secondaryValue: null };
}

/** Única fábrica de carta: mesmo shape que o `Deck` serializa no Redis. */
export function makeCard(rank: Rank, suit: Suit, extras?: CardExtras): Card {
  return {
    suit,
    rank,
    ...cardValues(rank),
    toString: `${rank} of ${suit}`,
    ...extras,
  };
}
