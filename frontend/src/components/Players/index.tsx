"use client";
import { useGameContext } from "@/contexts/game.context";
import { useSocket } from "@/contexts/socket.context";
import { Player } from "@/models/Users";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";
interface PlayerAvatar extends Player {
  isOnline: boolean;
}
export default function Players() {
  const [players, setPlayers] = useState<PlayerAvatar[]>([]);
  const { socket } = useSocket();
  const { turn } = useGameContext();

  useEffect(() => {
    if (!socket) return;
    socket.on("user_joined", (payload) => {
      const obj = JSON.parse(payload);
      toast(obj.message);
      setPlayers((m) => {
        const foundUser = m.find((x) => x.user.email === obj.player.user.email);
        if (!foundUser) return [...m, { ...obj.player, isOnline: true }];
        else {
          foundUser.isOnline = true;
          return [...m];
        }
      });
    });
    socket.on("load_players", (payload) => {
      const players = JSON.parse(payload);
      setPlayers([...players]);
    });
    socket.on("quit", (payload) => {
      const user = JSON.parse(payload);
      setPlayers((m) => {
        const playerFound = m.find(
          (player) => player.user.email === user.email
        );
        if (!playerFound) return [...m];
        playerFound.isOnline = false;
        return [...m];
      });
    });
    return () => {
      socket.off("quit");
      socket.off("user_joined");
      socket.off("load_players");
    };
  }, [socket]);
  return (
    <div className="flex gap-2">
      {players.map((players, i) => (
        <span
          className={twMerge(
            "p-2 text-black",
            players.isOnline ? "bg-green-500" : "bg-green-200",
            players.user.id === turn ? "border" : ""
          )}
          key={`${players.user?.email}-${i}`}
        >
          {players.user?.name}
        </span>
      ))}
    </div>
  );
}
