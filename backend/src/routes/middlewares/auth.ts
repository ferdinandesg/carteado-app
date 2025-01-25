import { NextFunction, Request, Response } from "express";
import prisma from "../../prisma";

export default async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ message: "NOT_AUTHORIZED" });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: authorization },
  });
  req.user = user;
  next();
}
