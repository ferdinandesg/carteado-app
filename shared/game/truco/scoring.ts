import type { Team } from "../../types/game";

/** Pontuação que encerra a partida. */
export const TRUCO_WINNING_SCORE = 12;

/** Escada de apostas: valor atual → próximo pedido (Truco, Seis, Nove, Doze). */
export const TRUCO_BET_LADDER: Record<number, number> = {
  1: 3,
  3: 6,
  6: 9,
  9: 12,
};

export const TRUCO_MAX_BET = 12;

export function nextTrucoBet(currentBet: number): number {
  return TRUCO_BET_LADDER[currentBet] ?? 3;
}

/**
 * Pontos que o time que pediu leva quando o adversário corre: a aposta que
 * valia antes do pedido (correr do Truco = 1, do Seis = 3, ...).
 */
export function trucoRejectPoints(currentBet: number): number {
  const previous = Object.entries(TRUCO_BET_LADDER).find(
    ([, raised]) => raised === currentBet
  )?.[0];
  return previous ? Number(previous) : 1;
}

/** Escudo de Prata: correr custa 1 ponto, qualquer que seja a aposta. */
export const SILVER_SHIELD_REJECT_POINTS = 1;

/**
 * Mercenário: o time vencedor ganha +1 e o perdedor perde 1 (nunca abaixo de
 * zero). Muta `teams`.
 */
export function applyMercenarySteal(teams: Team[], winningTeam: Team): void {
  winningTeam.score += 1;
  const loser = teams.find((team) => team.id !== winningTeam.id);
  if (loser) loser.score = Math.max(0, loser.score - 1);
}
