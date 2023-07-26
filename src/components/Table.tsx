import { GameContext } from "@/contexts/game.context";
import { useContext } from "react";
import CardComponent from "./Card";

export default function Table() {
  const { tableCards } = useContext(GameContext);

  return (
    <div className="group flex flex-col m-5 items-center">
      <span className="text-white font-semibold">Table has: {tableCards.length} cards</span>
      <div className="flex">
        {tableCards.map((card, i) => (
          <CardComponent
            className={`translate-x-[${i}rem]`}
            key={`table-${card.toString()}`}
            card={card}
          />
        ))}
      </div>
    </div>
  );
}
