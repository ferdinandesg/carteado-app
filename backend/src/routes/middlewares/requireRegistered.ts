import { NextFunction, Request, Response } from "express";

/** Bloqueia convidados em recursos que exigem conta persistida (ex.: amigos). */
export default function requireRegistered(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role === "guest") {
    res.status(403).json({ message: "GUESTS_NOT_ALLOWED" });
    return;
  }
  next();
}
