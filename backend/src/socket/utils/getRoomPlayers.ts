import { User } from "@prisma/client";
import { SocketUser } from "shared/types";
import { Namespace } from "socket.io";

export type RoomUsers = User & {
  status?: string;
  role?: "guest" | "user";
};

export default function getRoomPlayers(
  roomHash: string,
  channel: Namespace
): RoomUsers[] {
  const roomPlayers: SocketUser[] = [];
  const room = channel.adapter.rooms.get(roomHash);
  if (!room) return roomPlayers;
  for (const socketId of room) {
    const socket = channel.sockets.get(socketId);
    if (socket && socket.user) {
      roomPlayers.push(socket.user as SocketUser);
    }
  }
  return roomPlayers;
}
