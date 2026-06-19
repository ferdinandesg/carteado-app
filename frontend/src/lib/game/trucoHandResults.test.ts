import { Card } from "shared/cards";
import { HandResult } from "shared/types";

import { getTrucoHandResultCards } from "./trucoHandResults";

const makeCard = (value: Card["value"]): Card => ({
  value,
  suit: "hearts",
  rank: "A",
  secondaryValue: null,
  toString: "A of hearts",
});

describe("getTrucoHandResultCards", () => {
  const handsResults: HandResult[] = [
    { round: 1, bunch: [makeCard(3)], isTie: false },
    { round: 2, bunch: [makeCard(7)], isTie: false },
  ];

  it("returns cards from the current round when results exist", () => {
    expect(getTrucoHandResultCards(handsResults, 2)).toEqual([makeCard(7)]);
  });

  it("falls back to the previous round when no results exist yet", () => {
    expect(getTrucoHandResultCards([], 1)).toEqual([]);
    expect(getTrucoHandResultCards([], 0)).toEqual([]);
  });
});
