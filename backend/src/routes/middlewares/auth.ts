import { NextFunction, Request, Response } from "express";
import prisma from "../../prisma";

export default async function authorize(
  req: any,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;
  if (!authorization)
    return res.status(401).json({ message: "NOT_AUTHORIZED" });
  const user = await prisma.user.findUnique({
    where: { id: authorization },
  });
  req.user = user;
  next();
}
