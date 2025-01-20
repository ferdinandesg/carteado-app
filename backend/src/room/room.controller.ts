import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { createRoom, getRoom, listRooms } from "./room.service";

export async function handleCreateRoom(req: any, res: Response) {
  try {
    const { name, size } = req.body;
    const { user } = req;
    if (!name) throw "name property should be passed";
    const uuid = randomUUID();
    const hash = uuid.substring(uuid.length - 4);
    const newRoom = await createRoom({
      hash: hash,
      id: hash,
      name,
      size: +size,
      ownerId: user.id,
    }, user.id);
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json(error);
  }
}
export async function handleListRooms(req: Request, res: Response) {
  try {
    const rooms = await listRooms();

    res.status(200).json(rooms);
  } catch (error) {
    throw error;
  }
}

export async function handleGetRoom(req: Request, res: Response) {
  try {
    const { hash } = req.params;
    await getRoom(String(hash));
    res.status(200);
  } catch (error) {
    res.status(400).json(error);
  }
}
