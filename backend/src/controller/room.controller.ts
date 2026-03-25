import { Request, Response } from "express";
import { createRoom, getRoom, listRooms } from "@/services/room.service";
import { logger } from "@/utils/logger";
import { serializeRouteError } from "@/utils/routeError";

export async function handleCreateRoom(req: Request, res: Response) {
  try {
    const { name, size, rule } = req.body;
    const { user } = req;
    if (!name) throw "A sala não pode ser criada sem nome";
    const newRoom = await createRoom({ name, size: +size, rule }, user);

    res.status(201).json(newRoom);
  } catch (error) {
    logger.error({ err: error }, "handleCreateRoom");
    if (typeof error === "string") {
      res.status(400).json({ message: error });
      return;
    }
    res.status(500).json(serializeRouteError(error));
  }
}
export async function handleListRooms(_req: Request, res: Response) {
  try {
    const rooms = await listRooms();

    res.status(200).json(rooms);
  } catch (error) {
    logger.error({ err: error }, "handleListRooms");
    res.status(500).json(serializeRouteError(error));
  }
}

export async function handleGetRoom(req: Request, res: Response) {
  try {
    const { hash } = req.params;
    const room = await getRoom(String(hash));
    res.status(200).json(room);
  } catch (error) {
    logger.error({ err: error }, "handleGetRoom");
    if (typeof error === "string") {
      res.status(400).json({ message: error });
      return;
    }
    res.status(500).json(serializeRouteError(error));
  }
}
