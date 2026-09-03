import { Card } from "shared/cards";

import {
  applyGraveHoldToBunch,
  visualHandForGrave,
  type GraveHold,
  type PlayedEntry,
} from "./useTrucoPresentation";

const card = (
  rank: Card["rank"],
  suit: Card["suit"],
  value: Card["value"]
): Card => ({
  rank,
  suit,
  value,
  secondaryValue: null,
  toString: `${rank} of ${suit}`,
});

const outgoing = card("4", "hearts", 4);
const incoming = card("K", "clubs", 13);
const other = card("7", "spades", 7);

const hold: GraveHold = {
  id: 1,
  playerId: "me",
  outgoing,
  incoming,
};

describe("visualHandForGrave", () => {
  it("keeps the real hand; the Coveiro substitute comes from the deck", () => {
    expect(visualHandForGrave([outgoing, other], hold, "me")).toEqual([
      outgoing,
      other,
    ]);
  });
});

describe("applyGraveHoldToBunch", () => {
  it("puts the played card back on the table during the hold", () => {
    const entries: PlayedEntry[] = [
      { card: other, key: "7spades", playerId: "them" },
      { card: incoming, key: "Kclubs", playerId: "me" },
    ];

    expect(applyGraveHoldToBunch(entries, hold)).toEqual([
      entries[0],
      { card: outgoing, key: "4hearts", playerId: "me" },
    ]);
  });
});
