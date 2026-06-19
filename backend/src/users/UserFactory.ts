import prisma from "@/prisma";
import { getGuest, saveGuest } from "@/lib/redis/guests";
import {
  AuthenticatedUser,
  EmptyGuestType,
  GuestType,
  RegisteredSocketUser,
  UserRole,
  isRegisteredRole,
  normalizeRegisteredRole,
} from "shared/types";
import { PlayerStatus } from "shared/game";
import { randomUUID } from "node:crypto";

type JwtUserPayload = {
  role: UserRole;
  id: string;
};

type GuestInput = {
  username: string;
  skin?: string;
  avatar?: string;
};

const resolvers = {
  guest: async (id: string): Promise<GuestType | null> => {
    const guest = await getGuest(id);
    return {
      ...guest,
      isRegistered: false,
      room: guest.room ?? "",
      status: guest.status ?? PlayerStatus.NOT_READY,
    };
  },
  user: async (id: string): Promise<RegisteredSocketUser | null> => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const role = normalizeRegisteredRole(user.role);
    return {
      ...user,
      cash: user.cash ?? 0,
      xp: user.xp ?? 0,
      isRegistered: true,
      role,
      room: "",
      status: PlayerStatus.NOT_READY,
    };
  },
  admin: async (id: string): Promise<RegisteredSocketUser | null> => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const role = normalizeRegisteredRole(user.role);
    return {
      ...user,
      cash: user.cash ?? 0,
      xp: user.xp ?? 0,
      isRegistered: true,
      role,
      room: "",
      status: PlayerStatus.NOT_READY,
    };
  },
} as const;

export class UserFactory {
  static async fromJwtPayload(
    payload: JwtUserPayload
  ): Promise<AuthenticatedUser | null> {
    const resolver = resolvers[payload.role];
    if (!resolver) return null;
    return resolver(payload.id);
  }

  static async createGuest({
    username,
    skin,
    avatar,
  }: GuestInput): Promise<EmptyGuestType> {
    const uuid = randomUUID();
    const hash = uuid.substring(uuid.length - 4);
    const guestUser: EmptyGuestType = {
      id: uuid,
      email: `guest-${hash}@guest.com`,
      name: username,
      role: "guest",
      rank: 0,
      cash: 0,
      xp: 0,
      skin,
      image: avatar,
      isRegistered: false,
    };
    await saveGuest(guestUser);
    return guestUser;
  }

  static canOwnRoom(user: AuthenticatedUser): boolean {
    return isRegisteredRole(user.role);
  }
}
