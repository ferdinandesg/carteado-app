import { GameContext } from "@/contexts/game.context";
import { useContext } from "react";
import CardComponent from "./Card";

export default function Table() {
  const { tableCards } = useContext(GameContext);

  return (
    <div className="group flex bg-blue-500 flex-row h-10 m-5">
      {tableCards.map((card, i) => (
        <CardComponent
          className={`absolute group-hover:relative translate-x-${i}`}
          key={`table-${card.toString()}`}
          card={card}
        />
      ))}
    </div>
  );
}
