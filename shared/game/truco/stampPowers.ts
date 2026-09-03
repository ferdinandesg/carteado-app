import { Card, isTrucoRank } from "../../cards";
import {
  PowerId,
  TRUCO_POWERS_PER_ROUND,
  TRUCO_POWER_STAMP_CHANCE,
} from "../powers.types";
import { shuffleInPlace } from "../utils";

export type StampPowersOptions = {
  excludeRanks?: string[];
  limit?: number;
  chance?: number;
  random?: () => number;
};

/**
 * Carimba poderes em cartas distintas. Chamado só nas mãos do Truco —
 * nunca no vira, nunca em manilhas (`excludeRanks`). Cada carta elegível
 * tem `chance` de ser carimbada, até `TRUCO_POWERS_PER_ROUND` por mão.
 */
export function stampPowersOnDeck(
  cards: Card[],
  powerIds: PowerId[] = Object.values(PowerId),
  options?: StampPowersOptions
): void {
  const random = options?.random ?? Math.random;
  const excluded = new Set(options?.excludeRanks ?? []);
  const candidates = cards.filter(
    (card) => isTrucoRank(card.rank) && !excluded.has(card.rank)
  );
  const ids = [...powerIds];
  // `random` só decide o sorteio por carta; a ordem continua aleatória.
  shuffleInPlace(candidates);
  shuffleInPlace(ids);

  const limit = options?.limit ?? TRUCO_POWERS_PER_ROUND;
  const chance = options?.chance ?? TRUCO_POWER_STAMP_CHANCE;
  const max = Math.min(ids.length, candidates.length, limit);

  let stamped = 0;
  for (const card of candidates) {
    if (stamped >= max) break;
    if (random() >= chance) continue;
    card.powerId = ids[stamped];
    stamped++;
  }
}
