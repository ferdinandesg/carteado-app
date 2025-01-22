"use client";
import { twMerge } from "tailwind-merge";
import UserCard from "../UserCard";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";

export default function Players({ roomId }: { roomId: string }) {
  const { room } = useRoomByHash(roomId)
  const players = room?.players || [];
  return (
    <div className="flex gap-2 mt-2">
      {players.map((player) => (
        <UserCard key={`table-use:r-${player.email}`} user={player} />
      ))}
    </div>
  );
}
