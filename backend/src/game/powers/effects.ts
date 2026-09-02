import { randomUUID } from "node:crypto";
import type { Card } from "shared/cards";
import type { ActiveEffect, PowerId } from "shared/game";
import type { Team } from "shared/types";
import type { TrucoGame } from "../TrucoGameRules";
import { getPowerStrategy } from "./powerRegistry";

export function addEffect(
  game: TrucoGame,
  powerId: PowerId,
  sourceUserId: string,
  targetUserId: string
): ActiveEffect {
  const effect: ActiveEffect = {
    id: randomUUID(),
    powerId,
    sourceUserId,
    targetUserId,
    round: game.rounds,
  };
  game.activeEffects.push(effect);
  return effect;
}

export function removeEffect(game: TrucoGame, effectId: string): void {
  game.activeEffects = game.activeEffects.filter((e) => e.id !== effectId);
}

export function hasEffect(
  game: TrucoGame,
  targetUserId: string,
  powerId: PowerId
): boolean {
  return game.activeEffects.some(
    (e) => e.targetUserId === targetUserId && e.powerId === powerId
  );
}

/** Cópia: hooks podem remover efeitos durante a iteração. */
function effectsTargeting(game: TrucoGame, userId: string): ActiveEffect[] {
  return game.activeEffects.filter((e) => e.targetUserId === userId);
}

// Pontos de extensão chamados pelo TrucoGameRules. Cada efeito ativo é
// roteado para a strategy que o criou; o motor não conhece poderes específicos.

export function beforeAskTruco(game: TrucoGame, userId: string): void {
  for (const effect of effectsTargeting(game, userId)) {
    getPowerStrategy(effect.powerId).onBeforeAskTruco?.(game, effect, userId);
  }
}

export function beforePlayCard(
  game: TrucoGame,
  userId: string,
  card: Card
): void {
  for (const effect of effectsTargeting(game, userId)) {
    getPowerStrategy(effect.powerId).onBeforePlayCard?.(
      game,
      effect,
      userId,
      card
    );
  }
}

export function afterPlayCard(
  game: TrucoGame,
  userId: string,
  card: Card
): void {
  for (const effect of effectsTargeting(game, userId)) {
    getPowerStrategy(effect.powerId).onAfterPlayCard?.(
      game,
      effect,
      userId,
      card
    );
  }
}

export function adjustRejectPoints(
  game: TrucoGame,
  defendingUserIds: string[],
  points: number
): number {
  let next = points;
  for (const userId of defendingUserIds) {
    for (const effect of effectsTargeting(game, userId)) {
      const adjusted = getPowerStrategy(effect.powerId).onRejectTrucoPoints?.(
        game,
        effect,
        next
      );
      if (adjusted !== undefined) next = adjusted;
    }
  }
  return next;
}

export function afterFinishRound(game: TrucoGame, winningTeam: Team): void {
  for (const effect of [...game.activeEffects]) {
    getPowerStrategy(effect.powerId).onAfterFinishRound?.(
      game,
      effect,
      winningTeam
    );
  }
}
