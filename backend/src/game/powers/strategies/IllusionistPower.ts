import { findLastCardIndex } from "shared/cards";
import { disguiseAsZap, PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../../TrucoGameRules";
import type {
  PowerContext,
  PowerResult,
  PowerStrategy,
} from "../PowerStrategy";

/**
 * Ilusionista: a carta jogada aparece como Zap (manilha de paus) até a vaza
 * resolver. O valor real só entra na conta na revelação (`restoreIllusions`).
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

    const bunchIndex = findLastCardIndex(game.bunch, lastPlayed);
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
