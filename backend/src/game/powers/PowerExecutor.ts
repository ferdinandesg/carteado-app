import {
  BasePlayer,
  GameStatus,
  PowerId,
  PowerTrigger,
  UsePowerPayload,
} from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../TrucoGameRules";
import type { PowerResult, PowerStrategy } from "./PowerStrategy";
import { getPowerStrategy } from "./powerRegistry";

export type { PowerResult } from "./PowerStrategy";

/**
 * Decide se o jogador pode disparar o poder. É o ponto de extensão para o
 * futuro modo "cartas de realeza": basta fornecer outra política (ex.: exigir
 * que o jogador tenha jogado um K/Q/J) sem tocar nas strategies.
 */
export interface PowerPolicy {
  assertCanUse(game: TrucoGame, userId: string, powerId: PowerId): void;
}

/** Modo manual: cada jogador usa cada poder no máximo uma vez por rodada. */
export const manualPowerPolicy: PowerPolicy = {
  assertCanUse(game, userId, powerId) {
    const alreadyUsed = game.powerUsages.some(
      (u) =>
        u.userId === userId && u.powerId === powerId && u.round === game.rounds
    );
    if (alreadyUsed) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Você já usou este poder nesta rodada.",
      });
    }
  },
};

function resolveTarget(
  game: TrucoGame,
  strategy: PowerStrategy,
  userId: string,
  payload: UsePowerPayload
): BasePlayer | undefined {
  if (strategy.targeting === "NONE") return undefined;

  if (!payload.targetUserId) {
    throw new GameError({
      code: "VALIDATION",
      message: "Este poder exige um alvo.",
    });
  }
  const target = game.getPlayer(payload.targetUserId);
  if (!target) {
    throw new GameError({
      code: "INVALID_ACTION",
      message: "Alvo não está na partida.",
    });
  }

  const sourceTeam = game.rules.findTeamByUserId(game, userId);
  const targetTeam = game.rules.findTeamByUserId(game, target.userId);
  if (!sourceTeam || !targetTeam || sourceTeam.id === targetTeam.id) {
    throw new GameError({
      code: "INVALID_ACTION",
      message: "O alvo deve ser um adversário.",
    });
  }
  return target;
}

export function executePower(
  game: TrucoGame,
  userId: string,
  payload: UsePowerPayload,
  trigger: PowerTrigger = "MANUAL",
  policy: PowerPolicy = manualPowerPolicy
): PowerResult {
  if (game.status !== GameStatus.PLAYING) {
    throw new GameError({
      code: "INVALID_ACTION",
      message: "A partida não está em andamento.",
    });
  }
  if (!game.getPlayer(userId)) {
    throw new GameError({ code: "PLAYER_NOT_IN_ROOM" });
  }

  const strategy = getPowerStrategy(payload.powerId);
  policy.assertCanUse(game, userId, strategy.id);
  const target = resolveTarget(game, strategy, userId, payload);

  const result = strategy.execute(game, { userId, payload, target });
  game.pendingPrivateResult = result.privateResult;

  game.powerUsages.push({
    powerId: strategy.id,
    userId,
    targetUserId: target?.userId,
    round: game.rounds,
    trigger,
    returnedCard: result.returnedCard,
    replacementCard: result.replacementCard,
  });

  return result;
}
