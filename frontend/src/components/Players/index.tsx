"use client";
import { twMerge } from "tailwind-merge";
import UserCard from "../UserCard";
import { useRoomContext } from "@/contexts/room.context";

export default function Players() {
  const { players } = useRoomContext();
  
  return (
    <div className="flex gap-2 mt-2">
      {players.map((player) => (
        <div key={`table-user-${player.email}`} className={twMerge("border-2 border-white", false ? "border-green-600" : "")}>
          <UserCard user={player} />
          {/* <div className="flex">
            {player.hand.map(card => <CardComponent card={card} />)}
          </div> */}
        </div>

      ))}
    </div>
  );
}
