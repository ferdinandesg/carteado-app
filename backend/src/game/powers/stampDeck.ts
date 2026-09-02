import { Card, TRUCO_RANK_ORDER } from "shared/cards";
import { PowerId } from "shared/game";

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Carimba um de cada poder em cartas distintas. Chamado nas mãos já
 * distribuídas — nunca no vira, e nunca em manilhas (`excludeRanks`).
 */
export function stampPowersOnDeck(
  cards: Card[],
  powerIds: PowerId[] = Object.values(PowerId),
  options?: { excludeRanks?: string[] }
): void {
  const allowed = new Set(Object.keys(TRUCO_RANK_ORDER));
  const excluded = new Set(options?.excludeRanks ?? []);
  const candidates = cards.filter(
    (card) => allowed.has(card.rank) && !excluded.has(card.rank)
  );
  const ids = [...powerIds];
  shuffleInPlace(candidates);
  shuffleInPlace(ids);

  const count = Math.min(ids.length, candidates.length);
  for (let i = 0; i < count; i++) {
    candidates[i].powerId = ids[i];
  }
}
