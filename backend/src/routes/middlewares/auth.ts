import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../prisma";
import { getGuest } from "src/redis/guests";

const secretKey = "secret";

type JwtPayload = {
  role: "guest" | "user";
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

const verifyToken = async (token: string) => {
  const decoded = await promisifyVerifyToken(token);
  if (!decoded) {
    throw new Error("Token inválido");
  }
  if (decoded.role === "guest") {
    return await getGuest(decoded.id);
  }
  return await prisma.user.findUnique({
    where: { id: decoded.id },
  });
};

export default async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "NOT_AUTHORIZED" });
    return;
  }
  const user = await verifyToken(token);

  if (!user) {
    res.status(401).json({ message: "NOT_AUTHORIZED" });
    return;
  }
  req.user = user;
  next();
}
