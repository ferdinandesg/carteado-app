import { Card, TRUCO_RANK_ORDER } from "shared/cards";
import { PowerId, TRUCO_POWERS_PER_ROUND } from "shared/game";

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Carimba poderes em cartas distintas. Chamado só nas mãos do Truco —
 * nunca no vira, nunca em manilhas (`excludeRanks`), e no máximo
 * `TRUCO_POWERS_PER_ROUND` carimbos por rodada.
 */
export function stampPowersOnDeck(
  cards: Card[],
  powerIds: PowerId[] = Object.values(PowerId),
  options?: { excludeRanks?: string[]; limit?: number }
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
  const count = Math.min(ids.length, candidates.length, limit);
  for (let i = 0; i < count; i++) {
    candidates[i].powerId = ids[i];
  }
}
