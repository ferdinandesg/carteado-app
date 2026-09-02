import { Card, RANK_TO_VALUE, type Rank, type Suit } from "shared/cards";
import { PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../../TrucoGameRules";
import {
  isSameCard,
  type PowerContext,
  type PowerResult,
  type PowerStrategy,
} from "../PowerStrategy";

const ZAP_SUIT: Suit = "clubs";

/**
 * Ilusionista: a carta jogada aparece como Zap (manilha de paus) até a vaza
 * resolver. O valor real só entra na conta na revelação.
 */
export class IllusionistPower implements PowerStrategy {
  readonly id = PowerId.ILLUSIONIST;
  readonly targeting = "NONE" as const;

  execute(game: TrucoGame, ctx: PowerContext): PowerResult {
    const player = game.getPlayer(ctx.userId)!;
    const lastPlayed = player.playedCards[player.playedCards.length - 1];
    if (!lastPlayed) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Você ainda não jogou nenhuma carta.",
      });
    }

    const bunchIndex = findLastIndex(game.bunch, (card) =>
      isSameCard(card, lastPlayed)
    );
    if (bunchIndex === -1) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Sua última carta já saiu da mesa.",
      });
    }

    disguiseAsZap(lastPlayed, game.manilha);
    game.bunch[bunchIndex] = lastPlayed;
    return {};
  }
}

export function restoreIllusions(game: TrucoGame): void {
  for (const card of game.bunch) {
    restoreIllusion(card);
  }
  for (const player of game.players) {
    for (const card of player.playedCards) {
      restoreIllusion(card);
    }
  }
}

function disguiseAsZap(card: Card, manilha: string): void {
  if (card.illusionReal || !manilha) return;
  const rank = manilha as Rank;
  const value = RANK_TO_VALUE[rank];
  card.illusionReal = {
    rank: card.rank,
    suit: card.suit,
    toString: card.toString,
  };
  card.rank = rank;
  card.suit = ZAP_SUIT;
  card.toString = `${rank} of ${ZAP_SUIT}`;
  card.value = Array.isArray(value) ? value[0] : value;
  card.secondaryValue = Array.isArray(value) ? value[1] : null;
}

function restoreIllusion(card: Card): void {
  const real = card.illusionReal;
  if (!real) return;
  card.rank = real.rank;
  card.suit = real.suit;
  card.toString = real.toString;
  delete card.illusionReal;
}

function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
}
