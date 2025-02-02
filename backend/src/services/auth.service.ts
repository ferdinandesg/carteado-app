import { User } from "@prisma/client";
import prisma from "../prisma";
import { randomUUID } from "node:crypto";
import { saveGuest } from "src/redis/guests";
import { GuestType } from "shared/types";

type UserLogin = Omit<User, "id" | "rank">;
export async function validateUser(user: UserLogin): Promise<User> {
  const foundUser = await prisma.user.findFirst({
    where: { email: user.email },
  });
  if (!foundUser) {
    const userData = {
      email: user.email,
      name: user.name,
      image: user.image,
    };
    const newUser = await prisma.user.create({
      data: { ...userData, rank: 0 },
    });
    return newUser;
  } else return foundUser;
}

export async function validateGuestUser(username: string): Promise<GuestType> {
  const uuid = randomUUID();
  const hash = uuid.substring(uuid.length - 4);
  const guestUser = {
    id: uuid,
    email: `guest-${hash}@guest.com`,
    name: username,
    role: "guest",
  };
  await saveGuest(guestUser);
  return guestUser;
}
