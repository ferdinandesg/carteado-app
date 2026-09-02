import { BasePlayer, GameStatus, IGameState, PlayerStatus } from "shared/game";
import { Participant, RoomInterface } from "shared/types";

import { getTeamRelation, type TeamRelation } from "@/lib/game/teamRelation";

export type ParticipantBadgeStatus = "ready" | "waiting" | "away" | "playing";

/** Lobby uses participant.status; in-game prefers game player.status when available. */
export function getParticipantBadgeStatus(
  participant: Participant,
  player?: BasePlayer
): ParticipantBadgeStatus {
  if (!participant.isOnline) {
    return "away";
  }

  const status = player?.status ?? participant.status;

  if (status === PlayerStatus.READY) {
    return "ready";
  }

  if (status === PlayerStatus.PLAYING || status === PlayerStatus.CHOOSING) {
    return "playing";
  }

  return "waiting";
}

export type ParticipantView = {
  participant: Participant;
  badge: ParticipantBadgeStatus;
  isMe: boolean;
  isOwner: boolean;
  isGuest: boolean;
  /** Só durante a partida. */
  isTurn: boolean;
  handCount: number | null;
  team: TeamRelation;
};

function participantFromBot(player: BasePlayer): Participant {
  return {
    userId: player.userId,
    socketId: "",
    name: player.name,
    image: player.image,
    status: player.status,
    isRegistered: false,
    isOnline: true,
  };
}

function toParticipantView(
  participant: Participant,
  player: BasePlayer | undefined,
  game: IGameState | null,
  me: BasePlayer | null,
  room: RoomInterface,
  userId: string | null
): ParticipantView {
  const inGame = Boolean(game && player && game.status === GameStatus.PLAYING);

  return {
    participant,
    badge: getParticipantBadgeStatus(participant, player),
    isMe: participant.userId === userId,
    isOwner: participant.userId === room.ownerId,
    isGuest: !player?.isBot && !participant.isRegistered,
    isTurn: inGame && game!.playerTurn === participant.userId,
    handCount: inGame ? player!.hand.length : null,
    team: game && player && me ? getTeamRelation(game, player, me) : null,
  };
}

/**
 * Junta os dados reais da sala (`participants`) com o estado da partida
 * (`game.players`) em um único modelo pronto para renderizar. Bots só
 * existem no jogo: entram na lista durante a partida.
 */
export function buildParticipantViews(
  room: RoomInterface,
  game: IGameState | null,
  userId: string | null
): ParticipantView[] {
  const me = game?.players.find((p) => p.userId === userId) ?? null;

  const views = room.participants.map((participant) => {
    const player = game?.players.find((p) => p.userId === participant.userId);
    return toParticipantView(participant, player, game, me, room, userId);
  });

  if (!game || game.status !== GameStatus.PLAYING) return views;

  const seated = new Set(room.participants.map((p) => p.userId));
  for (const player of game.players) {
    if (!player.isBot || seated.has(player.userId)) continue;
    views.push(
      toParticipantView(
        participantFromBot(player),
        player,
        game,
        me,
        room,
        userId
      )
    );
  }

  return views;
}
