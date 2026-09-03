import { AuthenticatedUser, isRegisteredUser } from "shared/types/guest";
import { Participant } from "shared/types";
import { PlayerStatus } from "./base.player";

/** Fisher-Yates in place; `random` injetável para testes determinísticos. */
export function shuffleInPlace<T>(
  items: T[],
  random: () => number = Math.random
): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function pickRandom<T>(
  items: readonly T[],
  random: () => number = Math.random
): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(random() * items.length)];
}

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
