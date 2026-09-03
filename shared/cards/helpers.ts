import { Card } from "./";
import { TRUCO_RANK_ORDER, suitValueMap } from "./constants";

type CardIdentity = Pick<Card, "rank" | "suit">;

/** Mesma carta = mesmo rank e naipe (ignora poder, ilusão, `isHidden`). */
export function sameCard(a: CardIdentity, b: CardIdentity): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

/** Índice da última ocorrência de `card` em `cards`, ou -1. */
export function findLastCardIndex(cards: Card[], card: CardIdentity): number {
  for (let i = cards.length - 1; i >= 0; i--) {
    if (sameCard(cards[i], card)) return i;
  }
  return -1;
}

/** Ranks usados no Truco (baralho de 40 cartas: sem 8, 9 e 10). */
export const TRUCO_RANKS: readonly string[] = Object.keys(TRUCO_RANK_ORDER);

export function isTrucoRank(rank: string): boolean {
  return rank in TRUCO_RANK_ORDER;
}

export function getCardValue(card: Card, manilhaRank: string): number {
  if (card.rank === manilhaRank) {
    const suitVal = suitValueMap[card.suit] ?? 0;
    return 100 + suitVal;
  }
  const rankVal = TRUCO_RANK_ORDER[card.rank] ?? 0;
  return rankVal * 4;
}

export function getNextRank(rank: string): string {
  switch (rank) {
    case "3":
      return "4";
    case "2":
      return "3";
    case "A":
      return "2";
    case "K":
      return "A";
    case "J":
      return "K";
    case "Q":
      return "J";
    case "7":
      return "Q";
    case "6":
      return "7";
    case "5":
      return "6";
    case "4":
      return "5";
    default:
      return "J";
  }
}
