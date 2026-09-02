import { chooseTrucoBotCard, GameStatus, PowerId } from "shared/game";

import type { TrucoGame } from "../TrucoGameRules";

const MAX_BOT_STEPS = 24;

/**
 * Enquanto a vez (ou a resposta de truco) for de um bot, joga sozinho:
 * aceita truco e descarta a carta mais baixa. Sem `isBot`, não faz nada.
 *
 * Poderes manuais (`usePower`) o bot não dispara. Poder carimbado na carta
 * dispara ao jogar, via `applyPlayedCardPower` (alvo aleatório).
 */
export function playTrucoBots(game: TrucoGame): void {
  let steps = 0;
  while (game.status === GameStatus.PLAYING && steps < MAX_BOT_STEPS) {
    steps += 1;

    if (game.trucoState === "PENDING" && game.trucoAskerId) {
      const askerTeam = game.rules.findTeamByUserId(game, game.trucoAskerId);
      const responder = game.players.find((player) => {
        if (!player.isBot) return false;
        const team = game.rules.findTeamByUserId(game, player.userId);
        return Boolean(team && team.id !== askerTeam?.id);
      });
      if (!responder) return;
      game.rules.acceptTruco(game, responder.userId);
      continue;
    }

    const current = game.getPlayer(game.playerTurn);
    if (!current?.isBot) return;

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
    if (!card) return;
    game.playCard(current.userId, card);
  }
}
