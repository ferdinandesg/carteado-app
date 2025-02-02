import { Request, Response } from "express";
import { loginSchema } from "../schemas/auth.schemas";
import { validateGuestUser, validateUser } from "../services/auth.service";

export async function handleValidateUser(req: Request, res: Response) {
  try {
    const { email, name, image } = loginSchema.parse(req.body);

    const response = await validateUser({ email, name, image });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(error);
  }
}

export async function handleValidateGuest(req: Request, res: Response) {
  try {
    const { username } = req.body;
    const response = await validateGuestUser(username);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(error);
  }
}
