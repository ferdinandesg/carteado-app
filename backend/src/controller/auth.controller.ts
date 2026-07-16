import { Request, Response } from "express";
import { guestSchema, loginSchema } from "../schemas/auth.schemas";
import {
  toAuthProfile,
  validateGuestUser,
  validateUser,
} from "../services/auth.service";
import { withAccessToken } from "@/lib/authResponse";
import { serializeRouteError } from "@/utils/routeError";
import { reqLogger } from "@/utils/logContext";

export async function handleValidateUser(req: Request, res: Response) {
  try {
    const { email, name, image } = loginSchema.parse(req.body);
    const profile = await validateUser({ email, name, image });
    reqLogger(req).info(
      { userId: profile.id, role: profile.role, userName: profile.name },
      "Registered user authenticated."
    );
    res.status(200).json(withAccessToken(profile));
  } catch (error) {
    reqLogger(req).error(
      { err: error },
      "Failed to authenticate registered user."
    );
    res.status(400).json(serializeRouteError(error));
  }
}

export async function handleValidateGuest(req: Request, res: Response) {
  try {
    const { username, skin, avatar } = guestSchema.parse(req.body);
    const guest = await validateGuestUser(username, skin, avatar);
    reqLogger(req).info(
      { userId: guest.id, role: guest.role, userName: guest.name },
      "Guest user authenticated."
    );
    res.status(200).json(withAccessToken(guest));
  } catch (error) {
    reqLogger(req).error({ err: error }, "Failed to authenticate guest user.");
    res.status(400).json(serializeRouteError(error));
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  res.status(200).json(toAuthProfile(req.user));
}

export async function protectedRoute(req: Request, res: Response) {
  res
    .status(200)
    .json({ message: "Welcome to the protected route", user: req.user });
}
