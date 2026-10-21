import type { Team } from "../../types/game";
import { areTeammates, findTeamByUserId, getOpponentTeam } from "./teams";

const teams: Team[] = [
  { id: "TEAM_A", userIds: ["p1", "p3"], roundWins: 0, score: 0 },
  { id: "TEAM_B", userIds: ["p2", "p4"], roundWins: 0, score: 0 },
];

describe("truco teams", () => {
  it("finds the team of a player", () => {
    expect(findTeamByUserId(teams, "p3")?.id).toBe("TEAM_A");
    expect(findTeamByUserId(teams, "p4")?.id).toBe("TEAM_B");
    expect(findTeamByUserId(teams, "ghost")).toBeUndefined();
  });

  it("finds the opposing team", () => {
    expect(getOpponentTeam(teams, "p1")?.id).toBe("TEAM_B");
    expect(getOpponentTeam(teams, "p2")?.id).toBe("TEAM_A");
  });

  it("checks partnership, including the player themselves", () => {
    expect(areTeammates(teams, "p1", "p1")).toBe(true);
    expect(areTeammates(teams, "p1", "p3")).toBe(true);
    expect(areTeammates(teams, "p1", "p2")).toBe(false);
    expect(areTeammates(teams, "ghost", "p1")).toBe(false);
  });
});
