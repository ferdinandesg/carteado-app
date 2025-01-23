"use client";
import UserCard from "../UserCard";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";

export default function Players({ roomId }: { roomId: string }) {
  const { room } = useRoomByHash(roomId);
  const players = room?.players || [];
  return players.map((player) => (
    <UserCard
      key={`table-use:r-${player.email}`}
      user={player}
      size="small"
    />
  ));
}
