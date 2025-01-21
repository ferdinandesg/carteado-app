"use client";
import { twMerge } from "tailwind-merge";
import UserCard from "../UserCard";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";

export default function Players({ roomId }: { roomId: string }) {
  const { room } = useRoomByHash(roomId)
  const players = room?.players || [];
  console.log({
    players
  })
  return (
    <div className="flex gap-2 mt-2">
      {players.map((player) => (
        <div key={`table-user-${player.email}`} className={twMerge("border-2 border-white", false ? "border-green-600" : "")}>
          <UserCard user={player} />
        </div>
      ))}
    </div>
  );
}
