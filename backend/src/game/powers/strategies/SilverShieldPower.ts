import { PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../../TrucoGameRules";
import type {
  PowerContext,
  PowerResult,
  PowerStrategy,
} from "../PowerStrategy";
import { addEffect } from "../effects";

/**
 * Escudo de Prata: corre da rodada pagando 1 ponto, qualquer que seja a
 * aposta (Seis/Nove/Doze). Sem truco pendente, fica armado até o rejeitar.
 */
export class SilverShieldPower implements PowerStrategy {
  readonly id = PowerId.SILVER_SHIELD;
  readonly targeting = "NONE" as const;

  execute(game: TrucoGame, ctx: PowerContext): PowerResult {
    if (game.trucoState === "PENDING" && game.trucoAskerId) {
      const askingTeam = game.rules.findTeamByUserId(game, game.trucoAskerId);
      const userTeam = game.rules.findTeamByUserId(game, ctx.userId);
      if (!askingTeam || !userTeam) {
        throw new GameError({
          code: "INVALID_ACTION",
          message: "Não há um pedido de truco para correr.",
        });
      }
      if (askingTeam.id === userTeam.id) {
        throw new GameError({
          code: "INVALID_ACTION",
          message: "Você não pode usar o Escudo de Prata no próprio pedido.",
        });
      }
      addEffect(game, this.id, ctx.userId, ctx.userId);
      return { rejectPoints: 1 };
    }

    addEffect(game, this.id, ctx.userId, ctx.userId);
    return {};
  }

  onRejectTrucoPoints(): number {
    return 1;
  }
}
