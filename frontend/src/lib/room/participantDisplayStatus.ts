import { PlayerStatus } from "shared/game";
import { Participant } from "shared/types";

export type ParticipantBadgeStatus = "ready" | "waiting" | "away" | "playing";

export function getParticipantBadgeStatus(
  participant: Participant
): ParticipantBadgeStatus {
  if (!participant.isOnline) {
    return "away";
  }

  if (participant.status === PlayerStatus.READY) {
    return "ready";
  }

  if (
    participant.status === PlayerStatus.PLAYING ||
    participant.status === PlayerStatus.CHOOSING
  ) {
    return "playing";
  }

  return "waiting";
}
