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
 * Segunda Chance: troca uma carta da mão pela última carta que o jogador
 * jogou, desde que ela ainda esteja na mesa (mão atual não resolvida).
 * Atualiza `hand`, `playedCards` e `bunch` para manter `resolveHand` coerente.
 */
export class GravediggerPower implements PowerStrategy {
  readonly id = PowerId.GRAVEDIGGER;
  readonly targeting = "NONE" as const;

  execute(game: TrucoGame, ctx: PowerContext): PowerResult {
    const { card } = ctx.payload;
    if (!card) {
      throw new GameError({
        code: "VALIDATION",
        message: "Informe a carta da mão a ser trocada.",
      });
    }

    const player = game.getPlayer(ctx.userId)!;
    const handIndex = player.hand.findIndex((c) => isSameCard(c, card));
    if (handIndex === -1) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Essa carta não está na sua mão.",
      });
    }

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

    const fromHand = player.hand[handIndex];
    player.hand[handIndex] = lastPlayed;
    player.playedCards[player.playedCards.length - 1] = fromHand;
    game.bunch[bunchIndex] = fromHand;

    return {};
  }
}

function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
}
