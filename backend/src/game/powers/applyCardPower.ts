import { Card } from "shared/cards";
import {
  BasePlayer,
  isPowerId,
  pickRandom,
  UsePowerPayload,
} from "shared/game";

import type { TrucoGame } from "../TrucoGameRules";
import { executePower, type PowerPolicy } from "./PowerExecutor";
import { getPowerStrategy } from "./powerRegistry";

/** A carta carimbada é a permissão; não compartilha o cooldown do uso manual. */
export const cardPowerPolicy: PowerPolicy = {
  assertCanUse() {
    return;
  },
};

function pickRandomOpponent(
  game: TrucoGame,
  userId: string
): BasePlayer | undefined {
  const opponentTeam = game.rules.getOpponentTeam(game, userId);
  if (!opponentTeam) return undefined;
  return pickRandom(
    game.players.filter((player) =>
      opponentTeam.userIds.includes(player.userId)
    )
  );
}

/**
 * Dispara o poder carimbado na carta recém-jogada. Alvos (Raio-X, Silenciador,
 * Atração, Sexto Sentido) escolhem um adversário ao acaso. Falhas pontuais
 * (mão vazia, sem alvo, Coveiro sem carta restante no baralho) são ignoradas
 * para não reverter a jogada. Só existe no Truco.
 */
export function applyPlayedCardPower(
  game: TrucoGame,
  userId: string,
  card: Card
): void {
  const powerId = card.powerId;
  if (!powerId || !isPowerId(powerId)) return;
  delete card.powerId;

  const strategy = getPowerStrategy(powerId);
  const payload: UsePowerPayload = { powerId };

  if (strategy.targeting === "OPPONENT") {
    const opponent = pickRandomOpponent(game, userId);
    if (!opponent) return;
    payload.targetUserId = opponent.userId;
  }

  try {
    executePower(game, userId, payload, "CARD", cardPowerPolicy);
  } catch {
    // Coveiro sem mesa, baralho vazio no Vira-Casaca, etc.
  }
}
