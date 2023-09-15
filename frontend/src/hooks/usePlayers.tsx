import { useEffect, useState } from "react";
import { useSocket } from "../contexts/socket.context";
import { Player } from "@/models/Users";
import { toast } from "react-toastify";
import useCards from "./useCards";
import { Card } from "@/models/Cards";

export default function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { socket } = useSocket();
  const { playCard } = useCards();

  useEffect(() => {
    if (!socket) return;
    socket.on("user_joined", (payload) => {
      const obj = JSON.parse(payload);
      setPlayers(m => {
        if (m.some(x => x.user.id === obj.player.user.id)) return m
        return [...m, obj.player]
      })
      toast(obj.message);
    });
    socket.on("quit", (payload) => {
      const user = JSON.parse(payload);
      setPlayers((m) =>
        [...m.filter(
          (player) => player.user.email !== user.email
        )]
      );
    });
    socket.on("give_cards", (payload) => {
      const user = JSON.parse(payload);
      setPlayers((m) => {
        const found = m.find(x => x.user.id === user.id);
        if (!found) return m
        found.table = user.tableCards
        found.status = "choosing"
        return m
      });
    });
    socket.on("selected_hand", (payload) => {
      const obj = JSON.parse(payload);

      setPlayers(m => {
        const found = m.find(x => x.user.id === obj.player.user.id)
        if (!found) return [...m]
        found.hand = obj.player.hand
        found.table = obj.player.table
        found.status = "playing"
        return [...m]
      })
    });

    return () => {
      socket.off("quit");
      socket.off("give_cards");
      socket.off("user_joined");
      socket.off("selected_hand");
    };
  }, [socket]);


  const handlePickCards = (cards: Card[]) => {
    socket?.emit("pick_hand", { cards });
  };

  function refreshPlayer(player: Player) {
    setPlayers(m => {
      const found = m.find(x => x.user.id === player.user.id)
      if (!found) return [...m]
      found.hand = player.hand
      found.table = player.table

      return [...m]
    })
  }

  return { players, setPlayers, refreshPlayer, handlePickCards, playCard }
}
