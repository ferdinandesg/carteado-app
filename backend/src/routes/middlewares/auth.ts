import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "@/lib/jwt";
import { touchGuest } from "@/lib/redis/guests";
import { UserFactory } from "@/users/UserFactory";

export const verifyJWTToken = async (token: string | undefined) => {
  const decoded = await verifyAccessToken(token);
  if (!decoded) return null;
  const user = await UserFactory.fromJwtPayload(decoded);
  if (user?.role === "guest") {
    await touchGuest(user.id);
  }
  return user;
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
  } catch (error) {
    res.status(403).json({ message: "INVALID_TOKEN", error });
  }
}
