import { Card } from "./";
import { TRUCO_RANK_ORDER, suitValueMap } from "./constants";

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
    case "Q":
      return "K";
    case "J":
      return "Q";
    case "7":
      return "J";
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
