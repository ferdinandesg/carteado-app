import { Card } from "shared/cards";
import { HandResult } from "shared/types";

export function getTrucoHandResultCards(
  handsResults: HandResult[],
  rounds: number
): Card[] {
  const lastPlayedRound =
    handsResults.length > 0 ? rounds : Math.max(rounds - 1, 0);

  return handsResults
    .filter((result) => result.round === lastPlayedRound)
    .flatMap((result) => result.bunch);
}
