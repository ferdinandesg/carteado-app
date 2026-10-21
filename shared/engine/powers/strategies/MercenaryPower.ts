import { applyMercenarySteal, PowerId } from "../../../game";
import type { ActiveEffect } from "../../../game";
import type { Team } from "../../../types";
import type { TrucoGame } from "../../TrucoGameRules";
import type {
  PowerContext,
  PowerResult,
  PowerStrategy,
} from "../PowerStrategy";
import { addEffect } from "../effects";

/**
 * Mercenário: não muda a aposta. Se o time vencer a mão, rouba 1 ponto do
 * adversário (ganha +1 extra, eles perdem 1).
 */
export class MercenaryPower implements PowerStrategy {
  readonly id = PowerId.MERCENARY;
  readonly targeting = "NONE" as const;

  execute(game: TrucoGame, ctx: PowerContext): PowerResult {
    addEffect(game, this.id, ctx.userId, ctx.userId);
    return {};
  }

  onAfterFinishRound(
    game: TrucoGame,
    effect: ActiveEffect,
    winningTeam: Team
  ): void {
    if (!winningTeam.userIds.includes(effect.sourceUserId)) return;
    applyMercenarySteal(game.teams, winningTeam);
  }
}
