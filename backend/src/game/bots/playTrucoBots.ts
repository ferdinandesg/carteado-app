import { chooseTrucoBotCard, GameStatus, PowerId } from "shared/game";

import type { TrucoGame } from "../TrucoGameRules";

const MAX_BOT_STEPS = 24;

function findBotTrucoResponder(game: TrucoGame) {
  if (game.trucoState !== "PENDING" || !game.trucoAskerId) return undefined;
  const askerTeam = game.rules.findTeamByUserId(game, game.trucoAskerId);
  return game.players.find((player) => {
    if (!player.isBot) return false;
    const team = game.rules.findTeamByUserId(game, player.userId);
    return Boolean(team && team.id !== askerTeam?.id);
  });
}

/** Há uma ação de bot pendente (responder truco ou jogar na vez). */
export function needsTrucoBotAction(game: TrucoGame): boolean {
  if (game.status !== GameStatus.PLAYING) return false;
  if (findBotTrucoResponder(game)) return true;
  if (game.trucoState === "PENDING") return false;
  return Boolean(game.getPlayer(game.playerTurn)?.isBot);
}

/**
 * Executa uma única ação de bot. Retorna se jogou.
 * Poder carimbado dispara ao jogar (`applyPlayedCardPower`); `usePower` manual não.
 */
export function playTrucoBotStep(game: TrucoGame): boolean {
  if (game.status !== GameStatus.PLAYING) return false;

  const responder = findBotTrucoResponder(game);
  if (responder) {
    game.rules.acceptTruco(game, responder.userId);
    return true;
  }
  if (game.trucoState === "PENDING") return false;

  const current = game.getPlayer(game.playerTurn);
  if (!current?.isBot) return false;

  const mustPlayHighest = game.activeEffects.some(
    (effect) =>
      effect.targetUserId === current.userId &&
      effect.powerId === PowerId.MAGNETIC_PULL
  );
  const card = chooseTrucoBotCard(
    current.hand,
    game.manilha,
    mustPlayHighest ? "highest" : "lowest"
  );
  if (!card) return false;
  game.playCard(current.userId, card);
  return true;
}

/**
 * Enquanto a vez (ou a resposta de truco) for de um bot, joga sozinho.
 * Usado em testes; o servidor agenda um passo por vez com delay.
 */
export function playTrucoBots(game: TrucoGame): void {
  let steps = 0;
  while (steps < MAX_BOT_STEPS && playTrucoBotStep(game)) {
    steps += 1;
  }
}
