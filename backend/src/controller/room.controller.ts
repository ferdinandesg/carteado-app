import { Request, Response } from "express";
import { createRoom, getRoom, listRooms } from "../services/room.service";

export async function handleCreateRoom(req: any, res: Response) {
  try {
    const { name, size } = req.body;
    const { user } = req;
    if (!name) throw "A sala não pode ser criada sem nome";
    const newRoom = await createRoom({ name, size: +size }, user.id);

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
    const room = await getRoom(String(hash));
    res.status(200).json(room);
  } catch (error) {
    res.status(400).json(error);
  }
}
