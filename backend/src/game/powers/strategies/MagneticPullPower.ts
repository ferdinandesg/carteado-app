import { Card, getCardValue } from "shared/cards";
import { ActiveEffect, PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../../TrucoGameRules";
import type {
  PowerContext,
  PowerResult,
  PowerStrategy,
} from "../PowerStrategy";
import { addEffect, removeEffect } from "../effects";

/** Obriga o alvo a jogar sua carta mais alta na próxima jogada; consumido após ela. */
export class MagneticPullPower implements PowerStrategy {
  readonly id = PowerId.MAGNETIC_PULL;
  readonly targeting = "OPPONENT" as const;

  execute(game: TrucoGame, ctx: PowerContext): PowerResult {
    addEffect(game, this.id, ctx.userId, ctx.target!.userId);
    return {};
  }

  onBeforePlayCard(
    game: TrucoGame,
    _effect: ActiveEffect,
    userId: string,
    card: Card
  ): void {
    const hand = game.getPlayer(userId)?.hand ?? [];
    const highest = Math.max(...hand.map((c) => getCardValue(c, game.manilha)));
    if (getCardValue(card, game.manilha) < highest) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Atração magnética: você deve jogar sua carta mais alta.",
      });
    }
  }

  onAfterPlayCard(game: TrucoGame, effect: ActiveEffect): void {
    removeEffect(game, effect.id);
  }
}
