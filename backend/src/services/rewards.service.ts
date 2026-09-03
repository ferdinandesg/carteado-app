import prisma from "@/prisma";
import { TrucoGame } from "@/game/TrucoGameRules";
import { CarteadoGame } from "@/game/CarteadoGameRules";
import { GameStatus } from "shared/game";
import { logger } from "@/utils/logger";

type GameInstance = TrucoGame | CarteadoGame;

/**
 * Ganho de rank por partida, comparando o rank do jogador com a média
 * do lobby (jogadores registrados da partida):
 * - lobby mais fraco que o jogador  -> ganho menor
 * - lobby no nível do jogador       -> ganho médio
 * - lobby mais forte que o jogador  -> ganho maior
 */
export const RANK_GAIN = {
  LOBBY_BELOW_PLAYER: 15,
  LOBBY_AT_PLAYER: 20,
  LOBBY_ABOVE_PLAYER: 25,
} as const;

export function calculateRankGain(
  playerRank: number,
  lobbyAverageRank: number
): number {
  if (lobbyAverageRank < playerRank) return RANK_GAIN.LOBBY_BELOW_PLAYER;
  if (lobbyAverageRank > playerRank) return RANK_GAIN.LOBBY_ABOVE_PLAYER;
  return RANK_GAIN.LOBBY_AT_PLAYER;
}

/**
 * Gold por partida. Calibrado com o preço de um baralho na loja (400):
 * 2 vitórias ou 4 derrotas compram uma skin.
 */
export const GOLD_PER_WIN = 200;
export const GOLD_PER_LOSS = 100;

/** Ponto único para regras de gold por jogador; injete outra policy para variar. */
export interface GoldRewardContext {
  userId: string;
  isWinner: boolean;
  game: GameInstance;
}
export type GoldRewardPolicy = (context: GoldRewardContext) => number;

export const defaultGoldRewardPolicy: GoldRewardPolicy = ({ isWinner }) =>
  isWinner ? GOLD_PER_WIN : GOLD_PER_LOSS;

/** Vencedores da partida: time com 12+ no truco; `playerTurn` no carteado. */
export function getMatchWinnerIds(game: GameInstance): string[] {
  if (game.rulesName === "TrucoGameRules") {
    const winningTeam = (game as TrucoGame).teams.find(
      (team) => team.score >= 12
    );
    return winningTeam?.userIds ?? [];
  }
  return [game.playerTurn];
}

// Convidados usam ids de sessão (não são ObjectId do Mongo) e não recebem
// recompensas persistidas.
const OBJECT_ID_REGEX = /^[0-9a-f]{24}$/i;

/**
 * Aplica rank e gold de fim de partida uma única vez por jogo.
 * Retorna true quando as recompensas foram aplicadas (ou não havia o que
 * aplicar); false quando o jogo não terminou, já foi premiado ou houve erro
 * de persistência (nesse caso a flag não é marcada, permitindo retry).
 */
export async function applyEndOfMatchRewards(
  game: GameInstance,
  goldPolicy: GoldRewardPolicy = defaultGoldRewardPolicy
): Promise<boolean> {
  if (game.status !== GameStatus.FINISHED || game.rewardsApplied) return false;

  const registeredUserIds = game.players
    .map((player) => player.userId)
    .filter((id) => OBJECT_ID_REGEX.test(id));

  if (registeredUserIds.length === 0) {
    game.rewardsApplied = true;
    return true;
  }

  try {
    const users = await prisma.user.findMany({
      where: { id: { in: registeredUserIds } },
    });
    if (users.length === 0) {
      game.rewardsApplied = true;
      return true;
    }

    const lobbyAverageRank = Math.round(
      users.reduce((sum, user) => sum + user.rank, 0) / users.length
    );
    const winnerIds = new Set(getMatchWinnerIds(game));

    await Promise.all(
      users.map((user) =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            rank: user.rank + calculateRankGain(user.rank, lobbyAverageRank),
            // `cash` é o gold do jogador no schema atual
            cash:
              (user.cash ?? 0) +
              goldPolicy({
                userId: user.id,
                isWinner: winnerIds.has(user.id),
                game,
              }),
          },
        })
      )
    );

    game.rewardsApplied = true;
    return true;
  } catch (error) {
    logger.error(
      { err: error, players: registeredUserIds },
      "Failed to apply end-of-match rewards."
    );
    return false;
  }
}
