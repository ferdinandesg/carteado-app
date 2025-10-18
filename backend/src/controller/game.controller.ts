import { Request, Response } from "express";
import * as GameService from "../services/game.service";

export async function getGameByHash(req: Request, res: Response) {
  try {
    const { hash } = req.params;
    const game = await GameService.getGameInstance(hash);
    res.status(200).json(game);
  } catch (error) {
    res.status(404).json({ message: error });
  }
}
