import { BasePlayer, PlayerStatus } from "shared/game";
import { Participant } from "shared/types";

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
