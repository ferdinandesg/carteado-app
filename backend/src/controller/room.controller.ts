import { Request, Response } from "express";
import { createRoom, getRoom, listRooms } from "@/services/room.service";

export async function handleCreateRoom(req: Request, res: Response) {
  try {
    const { name, size, rule } = req.body;
    const { user } = req;
    if (!name) throw "A sala não pode ser criada sem nome";
    const newRoom = await createRoom({ name, size: +size, rule }, user);

    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json(error);
  }
}
export async function handleListRooms(_req: Request, res: Response) {
  try {
    const rooms = await listRooms();

    res.status(200).json(rooms);
  } catch (error) {
    res.status(400).json(error);
  }
}

export async function handleGetRoom(req: Request, res: Response) {
  try {
    const { hash } = req.params;
    const room = await getRoom(String(hash));
    res.status(200).json(room);
  } catch (error) {
    res.status(400).json(error);
  }
}
