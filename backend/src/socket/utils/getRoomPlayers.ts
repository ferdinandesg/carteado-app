import { User } from "@prisma/client";
import { Namespace } from "socket.io";

type RoomUsers = User & {
  status?: string
}

export default function getRoomPlayers(roomHash: string, channel: Namespace): RoomUsers[] {
  const roomPlayers = []
  const room = channel.adapter.rooms.get(roomHash)
  if (!room) return roomPlayers
  for (const socketId of room) {
    const socket = channel.sockets.get(socketId);
    if (socket && socket.user) {
      roomPlayers.push(socket.user);
    }
  }
  return roomPlayers;
}