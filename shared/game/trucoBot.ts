import { Card, getCardValue } from "shared/cards";

import { BasePlayer, PlayerStatus } from "./base.player";

export type TrucoBotPickMode = "lowest" | "highest";

/** Heurística mínima: joga a carta de menor (ou maior) valor, incluindo manilha. */
export function chooseTrucoBotCard(
  hand: Card[],
  manilha: string,
  mode: TrucoBotPickMode = "lowest"
): Card | null {
  if (hand.length === 0) return null;
  return hand.reduce((best, card) => {
    const delta = getCardValue(card, manilha) - getCardValue(best, manilha);
    if (mode === "highest") return delta > 0 ? card : best;
    return delta < 0 ? card : best;
  });
}

export function createTrucoBotPlayer(index: number): BasePlayer {
  return {
    userId: `bot-${index}`,
    name: `Bot ${index}`,
    status: PlayerStatus.WAITING,
    hand: [],
    playedCards: [],
    table: [],
    teamId: "",
    isBot: true,
  };
}

/** Completa a mesa até 2 ou 4 jogadores com bots. Não altera quem já está sentado. */
export function fillTrucoSeatsWithBots(
  players: BasePlayer[],
  seatCount: 2 | 4
): BasePlayer[] {
  const filled = [...players];
  let n = 1;
  while (filled.length < seatCount) {
    filled.push(createTrucoBotPlayer(n));
    n += 1;
  }
  return filled;
}
