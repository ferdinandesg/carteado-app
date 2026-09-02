import { Card } from "shared/cards";
import { HandResult } from "shared/types";

import { getTrickPilesByTeam } from "./trucoHandResults";

const makeCard = (value: Card["value"]): Card => ({
  value,
  suit: "hearts",
  rank: "A",
  secondaryValue: null,
  toString: "A of hearts",
});

describe("getTrickPilesByTeam", () => {
  const handsResults: HandResult[] = [
    { round: 1, bunch: [makeCard(3)], isTie: false, winnerTeamId: "TEAM_A" },
    { round: 2, bunch: [makeCard(7)], isTie: false, winnerTeamId: "TEAM_B" },
    { round: 2, bunch: [makeCard(2)], isTie: true, winnerTeamId: null },
    { round: 2, bunch: [makeCard(1)], isTie: false, winnerTeamId: "TEAM_A" },
  ];

  it("splits the current round results into ours / opponent / ties", () => {
    expect(getTrickPilesByTeam(handsResults, 2, "TEAM_A")).toEqual({
      ours: [makeCard(1)],
      opponent: [makeCard(7)],
      ties: [makeCard(2)],
      oursCount: 1,
      opponentCount: 1,
    });
  });

  it("ignores other rounds", () => {
    expect(getTrickPilesByTeam(handsResults, 1, "TEAM_B")).toEqual({
      ours: [],
      opponent: [makeCard(3)],
      ties: [],
      oursCount: 0,
      opponentCount: 1,
    });
  });

  it("returns empty piles when nothing was played", () => {
    expect(getTrickPilesByTeam([], 1, "TEAM_A").ours).toEqual([]);
  });
});
