import { PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../../TrucoGameRules";
import type {
  PowerContext,
  PowerResult,
  PowerStrategy,
} from "../PowerStrategy";

/** Espia uma carta aleatória da mão de um adversário (resultado privado). */
export class XRayPower implements PowerStrategy {
  readonly id = PowerId.X_RAY;
  readonly targeting = "OPPONENT" as const;

  execute(_game: TrucoGame, ctx: PowerContext): PowerResult {
    const target = ctx.target!;
    if (target.hand.length === 0) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "O alvo não tem cartas na mão.",
      });
    }
    const card = target.hand[Math.floor(Math.random() * target.hand.length)];
    return {
      privateResult: {
        powerId: PowerId.X_RAY,
        targetUserId: target.userId,
        card: { ...card },
      },
    };
  }
}
