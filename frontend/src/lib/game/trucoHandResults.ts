import { Card } from "shared/cards";
import { HandResult } from "shared/types";

export type TrickPiles = {
  ours: Card[];
  opponent: Card[];
  ties: Card[];
  oursCount: number;
  opponentCount: number;
};

/**
 * Separa as vazas já resolvidas de uma rodada em pilhas por time,
 * do ponto de vista do jogador local (`myTeamId`).
 */
export function getTrickPilesByTeam(
  handsResults: HandResult[],
  round: number,
  myTeamId: string | null
): TrickPiles {
  const piles: TrickPiles = {
    ours: [],
    opponent: [],
    ties: [],
    oursCount: 0,
    opponentCount: 0,
  };

  for (const result of handsResults) {
    if (result.round !== round) continue;

    if (result.isTie || !result.winnerTeamId) {
      piles.ties.push(...result.bunch);
    } else if (result.winnerTeamId === myTeamId) {
      piles.ours.push(...result.bunch);
      piles.oursCount += 1;
    } else {
      piles.opponent.push(...result.bunch);
      piles.opponentCount += 1;
    }
  }

  return piles;
}
