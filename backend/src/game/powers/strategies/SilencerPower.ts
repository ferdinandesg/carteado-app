import { PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../../TrucoGameRules";
import type {
  PowerContext,
  PowerResult,
  PowerStrategy,
} from "../PowerStrategy";
import { addEffect } from "../effects";

/** O alvo não pode pedir truco até o fim da rodada atual. */
export class SilencerPower implements PowerStrategy {
  readonly id = PowerId.SILENCER;
  readonly targeting = "OPPONENT" as const;

  execute(game: TrucoGame, ctx: PowerContext): PowerResult {
    addEffect(game, this.id, ctx.userId, ctx.target!.userId);
    return {};
  }

  onBeforeAskTruco(): void {
    throw new GameError({
      code: "INVALID_ACTION",
      message: "Você foi silenciado e não pode pedir truco nesta rodada.",
    });
  }
}
