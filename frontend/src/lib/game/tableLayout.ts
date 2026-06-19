import { BasePlayer } from "shared/game";

export type TableSeats = {
  top: BasePlayer | null;
  left: BasePlayer | null;
  right: BasePlayer | null;
};

export function resolveTableSeats(
  playerCount: number,
  orderedOpponents: BasePlayer[]
): TableSeats {
  if (orderedOpponents.length === 0) {
    return { top: null, left: null, right: null };
  }

  if (playerCount <= 2) {
    return { top: orderedOpponents[0], left: null, right: null };
  }

  return {
    left: orderedOpponents[0] ?? null,
    top: orderedOpponents[1] ?? null,
    right: orderedOpponents[2] ?? null,
  };
}
