import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { RoomInterface, roomSchema } from "./room.schema";
import { createRoom, getByHash, joinRoom, listRooms } from "./room.service";

export async function handleCreateRoom(req: any, res: Response) {
  try {
    const { name, size } = req.body;
    const { user } = req;
    if (!name) throw "name property should be passed";
    const uuid = randomUUID();
    const hash = uuid.substring(uuid.length - 4);
    const newRoom: RoomInterface = {
      hash: hash,
      id: hash,
      name,
      size: +size,
    };
    await createRoom(newRoom, user.id);
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
export async function handleGetRoomByHash(req: any, res: Response) {
  try {
    const { hash } = req.params;
    const user = req.user;
    const room = await getByHash(hash, user.id);
    res.status(200).json(room);
  } catch (error) {
    throw error;
  }
}
export function handleJoinRoom(req: Request, res: Response) {
  try {
    const { hash } = req.params;
    joinRoom(String(hash));
    res.status(200);
  } catch (error) {
    res.status(400).json(error);
  }
}
