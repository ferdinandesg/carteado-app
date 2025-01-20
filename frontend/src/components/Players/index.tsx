"use client";
import { twMerge } from "tailwind-merge";
import UserCard from "../UserCard";
import { useRoomContext } from "@/contexts/room.context";

export default function Players() {
  const { players, turn } = useRoomContext();
  
  return (
    <div className="flex gap-2 mt-2">
      {players.map((player, i) => (
        <div key={`table-user-${player.user.id}`} className={twMerge("border-2 border-white", turn === player.user.id ? "border-green-600" : "")}>
          <UserCard user={player.user} />
          {/* <div className="flex">
            {player.hand.map(card => <CardComponent card={card} />)}
          </div> */}
        </div>

      ))}
    </div>
  );
}
