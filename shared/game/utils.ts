import { GuestType, Participant, SocketUser } from "shared/types";
import { PlayerStatus } from "./base.player";

export const createParticipantObject = (
  user: SocketUser | GuestType
): Participant => {
  return {
    userId: user.id,
    status: PlayerStatus.NOT_READY, // Default status when joining
    name: user.name,
    image: user.image,
    socketId: user.id,
    isRegistered: user.role === "user",
  };
};
