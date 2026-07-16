import { Request, Response } from "express";
import { createRoom, getRoom, listRooms } from "@/services/room.service";
import { serializeRouteError } from "@/utils/routeError";
import { createRoomSchema } from "@/schemas/room.schemas";
import { ZodError } from "zod";
import { reqLogger } from "@/utils/logContext";

export async function handleCreateRoom(req: Request, res: Response) {
  try {
    const roomPayload = createRoomSchema.parse(req.body);
    const { user } = req;
    const newRoom = await createRoom(roomPayload, user);

    reqLogger(req).info({ roomHash: newRoom.hash }, "Room created.");
    res.status(201).json(newRoom);
  } catch (error) {
    reqLogger(req).error({ err: error }, "Failed to create room.");
    if (typeof error === "string") {
      res.status(400).json({ message: error });
      return;
    }
    if (error instanceof ZodError) {
      res.status(400).json(serializeRouteError(error));
      return;
    }
    res.status(500).json(serializeRouteError(error));
  }
}
export async function handleListRooms(req: Request, res: Response) {
  try {
    const rooms = await listRooms();

    res.status(200).json(rooms);
  } catch (error) {
    reqLogger(req).error({ err: error }, "Failed to list rooms.");
    res.status(500).json(serializeRouteError(error));
  }
}

export async function handleGetRoom(req: Request, res: Response) {
  const roomHash = String(req.params.hash);
  try {
    const room = await getRoom(roomHash);
    res.status(200).json(room);
  } catch (error) {
    reqLogger(req).error({ err: error, roomHash }, "Failed to get room.");
    if (typeof error === "string") {
      res.status(400).json({ message: error });
      return;
    }
    res.status(500).json(serializeRouteError(error));
  }
}
