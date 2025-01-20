import { User } from "@prisma/client";
import prisma from "../prisma";
type UserLogin = Omit<User, "id" | "rank">;
export async function validateUser(user: UserLogin): Promise<User> {
  try {
    const foundUser = await prisma.user.findFirst({
      where: { email: user.email },
    });
    if (!foundUser) {
      return await prisma.user.create({ data: { ...user, rank: 0, image: "" } });
    } else return foundUser;
  } catch (error) {
    throw error;
  }
}
