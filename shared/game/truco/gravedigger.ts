import { Card, getCardValue, isTrucoRank } from "../../cards";

/**
 * Coveiro: índices das cartas restantes no baralho com valor de Truco
 * maior ou igual ao da carta jogada.
 */
export function findGravediggerCandidates(
  deckCards: Card[],
  played: Card,
  manilha: string
): number[] {
  const minValue = getCardValue(played, manilha);
  const indexes: number[] = [];
  deckCards.forEach((card, index) => {
    if (!isTrucoRank(card.rank)) return;
    if (getCardValue(card, manilha) >= minValue) indexes.push(index);
  });
  return indexes;
}
