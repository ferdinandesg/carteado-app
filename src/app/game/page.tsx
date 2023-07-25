"use client";

import CardComponent from "@/components/Card";
import Table from "@/components/Table";
import { GameContext } from "@/contexts/game.context";
import { useContext } from "react";

export default function Game() {
  const { deck, isLoading, playerCards, playCard } = useContext(GameContext);
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col w-1/2 m-auto h-1/2 p-3">
      <Table />
      <div className="flex flex-wrap gap-2 justify-center">
        {playerCards.map((card) => (
          <span onClick={() => playCard!(card)} key={card.toString()}>
            <CardComponent card={card} />
          </span>
        ))}
      </div>
      <button
        className="bg-gray-500 hover:bg-gray-600 transition mt-2 p-2 text-white"
        onClick={() => {}}
      >
        Draw a card
      </button>
    </div>
  );
}
