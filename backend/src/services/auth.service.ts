import { User } from "@prisma/client";
import prisma from "../prisma";
import { randomUUID } from "node:crypto";
import { saveGuest } from "src/redis/guests";
import { EmptyGuestType } from "shared/types";

type UserLogin = Omit<User, "id" | "role">;

export async function validateUser(user: UserLogin): Promise<User> {
  const foundUser = await prisma.user.findFirst({
    where: { email: user.email },
  });
  if (!foundUser) {
    const userData = {
      email: user.email,
      name: user.name,
      image: user.image,
      rank: user.rank,
    };
    const newUser = await prisma.user.create({
      data: { ...userData, rank: 0 },
    });
    return newUser;
  } else return foundUser;
}

export async function validateGuestUser(
  username: string
): Promise<EmptyGuestType> {
  const uuid = randomUUID();
  const hash = uuid.substring(uuid.length - 4);
  const guestUser: EmptyGuestType = {
    id: uuid as string,
    email: `guest-${hash}@guest.com`,
    name: username,
    role: "guest",
    rank: 0,
    isRegistered: false,
  };
  await saveGuest(guestUser);
  return guestUser;
}
