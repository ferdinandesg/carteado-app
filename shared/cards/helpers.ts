import { Card } from "./";
import { TRUCO_RANK_ORDER, suitValueMap } from "./constants";

export function getCardValue(card: Card, manilhaRank: string): number {
  const suitVal = suitValueMap[card.suit] ?? 0;

  if (card.rank === manilhaRank) {
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
