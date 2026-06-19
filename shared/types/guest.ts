import { PlayerStatus } from "shared/game";

export type RegisteredUserRole = "user" | "admin";
export type UserRole = "guest" | RegisteredUserRole;

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image: string;
  rank: number;
  cash: number;
  xp: number;
};

type UserMeta = {
  id: string;
  email: string;
  name: string;
  rank: number;
  cash: number;
  xp: number;
  room: string;
  status: PlayerStatus;
  isRegistered: boolean;
  image?: string | null;
  skin?: string | null;
};

export type EmptyGuestType = Omit<GuestType, "room" | "status">;

export type GuestType = UserMeta & {
  role: "guest";
  isRegistered?: boolean;
};

export type SocketUser = UserMeta & {
  role: "user";
};

export type AdminSocketUser = UserMeta & {
  role: "admin";
};

export type RegisteredSocketUser = SocketUser | AdminSocketUser;
export type AuthenticatedUser = GuestType | RegisteredSocketUser;

export const isRegisteredRole = (role: UserRole): role is RegisteredUserRole =>
  role !== "guest";

export const isRegisteredUser = (
  user: Pick<AuthenticatedUser, "role">
): user is RegisteredSocketUser => isRegisteredRole(user.role);

export function normalizeRegisteredRole(
  role: string | null | undefined
): RegisteredUserRole {
  return role === "admin" ? "admin" : "user";
}
