import type { Team } from "../../types/game";

export function findTeamByUserId(
  teams: Team[],
  userId: string
): Team | undefined {
  return teams.find((team) => team.userIds.includes(userId));
}

export function getOpponentTeam(
  teams: Team[],
  userId: string
): Team | undefined {
  const own = findTeamByUserId(teams, userId)?.id;
  return teams.find((team) => team.id !== own);
}

/** `true` quando ambos estão no mesmo time (inclui o próprio jogador). */
export function areTeammates(teams: Team[], a: string, b: string): boolean {
  if (a === b) return true;
  const teamA = findTeamByUserId(teams, a);
  return Boolean(teamA && teamA.userIds.includes(b));
}
