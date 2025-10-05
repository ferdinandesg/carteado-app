import { useSocket } from "@/contexts/socket.context";
import { Card } from "shared/cards";

import { useEffect, useState } from "react";

export default function useCards() {
  const { socket } = useSocket();
  const [, setPickCards] = useState<boolean>(false);

  useEffect(() => {
    socket.on("pick_hands", () => setPickCards(true));
  }, []);

  function playCard(card: Card) {
    socket.emit("play_card", { card });
  }

  const handlePickCards = (cards: Card[]) => {
    socket.emit("pick_hand", { cards });
  };

  const undoPlay = (card: Card) => {
    socket.emit("retrieve_card", { card });
  };

  return { playCard, handlePickCards, undoPlay };
}
