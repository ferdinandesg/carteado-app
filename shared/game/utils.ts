import {
  AuthenticatedUser,
  isRegisteredUser,
} from "shared/types/guest";
import { Participant } from "shared/types";
import { PlayerStatus } from "./base.player";

export const createParticipantObject = (
  user: AuthenticatedUser
): Participant => {
  return {
    userId: user.id,
    status: PlayerStatus.NOT_READY, // Default status when joining
    name: user.name,
    image: user.image ?? undefined,
    socketId: user.id,
    isRegistered: isRegisteredUser(user),
    isOnline: true,
  };
};
