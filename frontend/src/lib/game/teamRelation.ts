import { BasePlayer, IGameState, isTrucoGame } from "shared/game";

export type TeamRelation = "ally" | "rival" | null;

/** Truco guarda os times em `game.teams`; outros jogos em `player.teamId`. */
export function resolveTeamId(
  game: IGameState,
  player: BasePlayer
): string | null {
  if (isTrucoGame(game)) {
    return (
      game.teams.find((team) => team.userIds.includes(player.userId))?.id ??
      null
    );
  }
  return player.teamId || null;
}

export function getTeamRelation(
  game: IGameState,
  player: BasePlayer,
  mainPlayer: BasePlayer
): TeamRelation {
  if (player.userId === mainPlayer.userId) return "ally";
  const mine = resolveTeamId(game, mainPlayer);
  const theirs = resolveTeamId(game, player);
  if (!mine || !theirs) return null;
  return mine === theirs ? "ally" : "rival";
}
