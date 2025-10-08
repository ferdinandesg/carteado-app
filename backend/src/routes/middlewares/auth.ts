import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../prisma";
import { getGuest } from "src/redis/guests";
import { SocketUser, UserRole } from "shared/types";

type JwtPayload = {
  role: UserRole;
  id: string;
};

const promisifyVerifyToken = (token: string) => {
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as JwtPayload);
      }
    });
  });
};

export const verifyJWTToken = async (token: string) => {
  const decoded = await promisifyVerifyToken(token);

  let user;
  if (decoded.role === "guest") {
    user = await getGuest(decoded.id);
  } else {
    user = (await prisma.user.findUnique({
      where: { id: decoded.id },
    })) as SocketUser;
  }
  if (!user) return null;
  user.isRegistered = decoded.role === "user";
  return user as SocketUser;
};

export default async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "NO_TOKEN_PROVIDED" });
      return;
    }
    const user = await verifyJWTToken(token);
    if (!user) {
      res.status(401).json({ message: "NOT_AUTHORIZED" });
      return;
    }
    req.user = user;
    next();
  } catch (_error) {
    res.status(403).json({ message: "INVALID_TOKEN" });
  }
}
