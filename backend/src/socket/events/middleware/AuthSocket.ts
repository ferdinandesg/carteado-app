import { Socket } from "socket.io";
import prisma from "../../../prisma";
import { User } from "@prisma/client";

const DEFAULT_USER = {
  email: "convidado@gmail.com",
  name: "Nome do convidado",
  image: "",
};

export async function Authentication(
  socket: any,
  next: Function
): Promise<void> {
  try {
    const { user } = socket.handshake.query;

    const parsedUser = JSON.parse(user);
    const auth = await validateUser(parsedUser);
    socket.user = auth;
    socket.join(socket.user.email);
    return next(null, true);
  } catch (err) {
    console.error({ err });
  }
}

const validateUser = async (user: User) => {
  try {
    const foundUser = await prisma.user.findFirst({
      where: { email: user.email },
    });
    if (!foundUser) {
      return await prisma.user.create({ data: { ...user, rank: 0 } });
    } else return foundUser;
  } catch (error) {
    throw error;
  }
};
