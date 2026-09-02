import { Card, getCardValue, TRUCO_RANK_ORDER } from "shared/cards";
import { PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../../TrucoGameRules";
import {
  isSameCard,
  PowerContext,
  PowerResult,
  PowerStrategy,
} from "../PowerStrategy";

/**
 * Coveiro: devolve a última carta jogada ao baralho e traz do restante uma
 * carta de valor de truco maior ou igual. Só vale se a jogada ainda está na
 * mesa. Atualiza `playedCards` e `bunch` para manter `resolveHand` coerente.
 */
export class GravediggerPower implements PowerStrategy {
  readonly id = PowerId.GRAVEDIGGER;
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

    const bunchIndex = findLastIndex(game.bunch, (c) =>
      isSameCard(c, lastPlayed)
    );
    if (bunchIndex === -1) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Sua última carta já saiu da mesa.",
      });
    }

    const picked = pickDeckCardAtLeast(game, lastPlayed);
    if (!picked) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Não há carta restante com valor maior ou igual.",
      });
    }

    const { card: replacement, index } = picked;
    delete replacement.powerId;
    game.deck.cards.splice(index, 1);
    game.deck.cards.unshift(lastPlayed);

    player.playedCards[player.playedCards.length - 1] = replacement;
    game.bunch[bunchIndex] = replacement;

    return { returnedCard: lastPlayed, replacementCard: replacement };
  }
}

function pickDeckCardAtLeast(
  game: TrucoGame,
  played: Card
): { card: Card; index: number } | null {
  const minValue = getCardValue(played, game.manilha);
  const allowed = new Set(Object.keys(TRUCO_RANK_ORDER));
  const candidates: { card: Card; index: number }[] = [];

  game.deck.cards.forEach((card, index) => {
    if (!allowed.has(card.rank)) return;
    if (getCardValue(card, game.manilha) >= minValue) {
      candidates.push({ card, index });
    }
  });

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
}
