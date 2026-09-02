import { Card, TRUCO_RANK_ORDER } from "shared/cards";
import {
  PowerId,
  TRUCO_POWERS_PER_ROUND,
  TRUCO_POWER_STAMP_CHANCE,
} from "shared/game";

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Carimba poderes em cartas distintas. Chamado só nas mãos do Truco —
 * nunca no vira, nunca em manilhas (`excludeRanks`). Cada carta elegível
 * tem `chance` de ser carimbada, até `TRUCO_POWERS_PER_ROUND` por mão.
 */
export function stampPowersOnDeck(
  cards: Card[],
  powerIds: PowerId[] = Object.values(PowerId),
  options?: {
    excludeRanks?: string[];
    limit?: number;
    chance?: number;
    random?: () => number;
  }
): void {
  const allowed = new Set(Object.keys(TRUCO_RANK_ORDER));
  const excluded = new Set(options?.excludeRanks ?? []);
  const candidates = cards.filter(
    (card) => allowed.has(card.rank) && !excluded.has(card.rank)
  );
  const ids = [...powerIds];
  shuffleInPlace(candidates);
  shuffleInPlace(ids);

  const limit = options?.limit ?? TRUCO_POWERS_PER_ROUND;
  const chance = options?.chance ?? TRUCO_POWER_STAMP_CHANCE;
  const random = options?.random ?? Math.random;
  const max = Math.min(ids.length, candidates.length, limit);

  let stamped = 0;
  for (const card of candidates) {
    if (stamped >= max) break;
    if (random() >= chance) continue;
    card.powerId = ids[stamped];
    stamped++;
  }
}
