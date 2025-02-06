import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../prisma";
import { getGuest } from "src/redis/guests";
import { SocketUser, UserRole } from "shared/types";

const secretKey = "secret";

type JwtPayload = {
  role: UserRole;
  id: string;
};

const promisifyVerifyToken = (token: string): Promise<JwtPayload> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        reject(err);
      }
      resolve(decoded as JwtPayload);
    });
  });

export const verifyJWTToken = async (token: string) => {
  const decoded = await promisifyVerifyToken(token);
  if (decoded.role === "guest") {
    return await getGuest(decoded.id);
  }
  return (await prisma.user.findUnique({
    where: { id: decoded.id },
  })) as SocketUser;
};

export default async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "NOT_AUTHORIZED" });
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
