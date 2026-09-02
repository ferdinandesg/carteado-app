import { PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../../TrucoGameRules";
import type {
  PowerContext,
  PowerResult,
  PowerStrategy,
} from "../PowerStrategy";

/** Sexto Sentido: diz só se o alvo tem alguma manilha, sem revelar qual. */
export class SixthSensePower implements PowerStrategy {
  readonly id = PowerId.SIXTH_SENSE;
  readonly targeting = "OPPONENT" as const;

  execute(game: TrucoGame, ctx: PowerContext): PowerResult {
    const target = ctx.target!;
    if (target.hand.length === 0) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "O alvo não tem cartas na mão.",
      });
    }
    return {
      privateResult: {
        powerId: PowerId.SIXTH_SENSE,
        targetUserId: target.userId,
        hasManilha: target.hand.some((card) => card.rank === game.manilha),
      },
    };
  }
}
