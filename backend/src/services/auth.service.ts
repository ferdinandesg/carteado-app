import { User } from "@prisma/client";
import prisma from "../prisma";
import {
  EmptyGuestType,
  RegisteredUserRole,
  normalizeRegisteredRole,
} from "shared/types";
import { logger } from "@/utils/logger";
import { UserFactory } from "@/users/UserFactory";

type UserLogin = Omit<User, "id" | "role" | "skin">;

export type RegisteredAuthProfile = {
  id: string;
  email: string;
  name: string;
  image: string;
  rank: number;
  role: RegisteredUserRole;
  skin: string | null;
};

function toRegisteredProfile(user: User): RegisteredAuthProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    rank: user.rank,
    role: normalizeRegisteredRole(user.role),
    skin: user.skin,
  };
}

export async function validateUser(
  user: UserLogin
): Promise<RegisteredAuthProfile> {
  const foundUser = await prisma.user.findFirst({
    where: { email: user.email },
  });
  if (!foundUser) {
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        image: user.image,
        rank: 0,
      },
    });
    return toRegisteredProfile(newUser);
  }
  return toRegisteredProfile(foundUser);
}

export async function validateGuestUser(
  username: string,
  skin?: string,
  avatar?: string
): Promise<EmptyGuestType> {
  const guestUser = await UserFactory.createGuest({ username, skin, avatar });
  logger.info({ guestUser }, "Criando usuário convidado:");
  return guestUser;
}
