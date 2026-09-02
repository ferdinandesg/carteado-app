import { Card } from "shared/cards";

/**
 * Chave estável para uma carta na UI. Em baralhos com duplicatas (Carteado)
 * o índice desambigua; no Truco (40 cartas únicas) `rank+suit` basta.
 */
export function getCardKey(card: Card, index?: number): string {
  const base = `${card.rank}${card.suit}`;
  return index === undefined ? base : `${base}#${index}`;
}

/** Chaves únicas para uma lista, adicionando o índice só quando há colisão. */
export function getCardKeys(cards: Card[]): string[] {
  const seen = new Map<string, number>();
  return cards.map((card, index) => {
    const base = getCardKey(card);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : getCardKey(card, index);
  });
}
