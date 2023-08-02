import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { RoomInterface, roomSchema } from "./room.schema";
import { createRoom, getByHash, joinRoom, listRooms } from "./room.service";

export async function handleCreateRoom(req: Request, res: Response) {
  try {
    const { name } = req.body;
    if (!name) throw "name property should be passed";
    const uuid = randomUUID();
    const hash = uuid.substring(uuid.length - 4);
    const newRoom: RoomInterface = {
      hash: hash,
      id: hash,
      name,
      players: [],
    };
    await createRoom(newRoom);
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json(error);
  }
}
export function handleListRooms(req: Request, res: Response) {
  try {
    const rooms = listRooms();
    res.status(200).json(rooms);
  } catch (error) {
    throw error;
  }
}
export async function handleGetRoomByHash(req: Request, res: Response) {
  try {
    const { hash } = req.params;
    const room = await getByHash(hash);
    res.status(200).json(room);
  } catch (error) {
    throw error;
  }
}
export function handleJoinRoom(req: Request, res: Response) {
  try {
    const { hash } = req.params;
    joinRoom(String(hash), "no name");
    res.status(200);
  } catch (error) {
    res.status(400).json(error);
  }
}
