import { User } from "@prisma/client";
import prisma from "../prisma";
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
