import { Card, getCardValue } from "../../cards";
import type { HandResult, Team } from "../../types/game";
import { findTeamByUserId } from "./teams";

export type TrickEntry = { card: Card; userId: string };

export type TrickOutcome = {
  winnerUserId: string | null;
  winnerTeamId: Team["id"] | null;
  /** Cartas mais altas em times diferentes. */
  isTie: boolean;
};

/**
 * Vencedor da vaza pela escala do Truco (`getCardValue`). Empate só quando
 * as cartas mais altas pertencem a times diferentes; entre parceiros, leva
 * quem jogou primeiro.
 */
export function resolveTrickWinner(
  entries: TrickEntry[],
  manilha: string,
  teams: Team[]
): TrickOutcome {
  if (entries.length === 0) {
    return { winnerUserId: null, winnerTeamId: null, isTie: false };
  }

  let highest = -1;
  let leaders: TrickEntry[] = [];
  for (const entry of entries) {
    const value = getCardValue(entry.card, manilha);
    if (value > highest) {
      highest = value;
      leaders = [entry];
    } else if (value === highest) {
      leaders.push(entry);
    }
  }

  const firstTeam = findTeamByUserId(teams, leaders[0].userId)?.id ?? null;
  const isTie = leaders.some(
    (entry) => findTeamByUserId(teams, entry.userId)?.id !== firstTeam
  );
  if (isTie) return { winnerUserId: null, winnerTeamId: null, isTie: true };

  return {
    winnerUserId: leaders[0].userId,
    winnerTeamId: firstTeam,
    isTie: false,
  };
}

export type RoundOutcome =
  | { kind: "continue" }
  | {
      kind: "won";
      team: Team;
    } /** Três vazas sem vencedor (primeira empatada): ninguém pontua. */
  | { kind: "void" };

/**
 * Decide a rodada a partir de `roundWins` (empate conta para ambos) e dos
 * resultados das vazas desta rodada.
 */
export function resolveRoundOutcome(
  teams: Team[],
  roundResults: HandResult[]
): RoundOutcome {
  const [teamA, teamB] = teams;
  if (roundResults.length < 2) return { kind: "continue" };

  if (teamA.roundWins >= 2 && teamA.roundWins > teamB.roundWins) {
    return { kind: "won", team: teamA };
  }
  if (teamB.roundWins >= 2 && teamB.roundWins > teamA.roundWins) {
    return { kind: "won", team: teamB };
  }
  if (roundResults.length < 3) return { kind: "continue" };

  if (teamA.roundWins > teamB.roundWins) return { kind: "won", team: teamA };
  if (teamB.roundWins > teamA.roundWins) return { kind: "won", team: teamB };

  // Tudo igual: quem fez a primeira vaza leva a rodada.
  const firstWinner = teams.find(
    (team) => team.id === roundResults[0].winnerTeamId
  );
  return firstWinner ? { kind: "won", team: firstWinner } : { kind: "void" };
}
