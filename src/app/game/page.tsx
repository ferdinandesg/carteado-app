"use client";

import CardComponent from "@/components/Card";
import Table from "@/components/Table";
import { GameContext } from "@/contexts/game.context";
import { useContext } from "react";

export default function Game() {
  const { deck, isLoading, playerCards, playCard, drawCard } = useContext(GameContext);
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col m-auto  p-3 bg-red-500">
      <Table />
      <div className="flex flex-wrap gap-2 justify-center">
        {playerCards.map((card) => (
          <CardComponent
            card={card}
            className="hover:-translate-y-3"
            onClick={() => playCard!(card)}
            key={card.toString()}
          />
        ))}
      </div>
      <button
        className="bg-gray-500 hover:bg-gray-600 transition mt-2 p-2 text-white"
        onClick={drawCard}
      >
        Draw a card
      </button>
    </div>
  );
}
