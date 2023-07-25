import { GameContext } from "@/contexts/game.context";
import { useContext } from "react";
import CardComponent from "./Card";

export default function Table() {
  const { tableCards } = useContext(GameContext);
  console.log({ tableCards });

  return (
    <div className="h-10 w-10">
      {tableCards.map((card) => (
        <span key={`table-${card.toString()}`} className="absolute">
          <CardComponent card={card} />
        </span>
      ))}
    </div>
  );
}
