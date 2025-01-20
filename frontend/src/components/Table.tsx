import { useGameContext } from "@/contexts/game.context";
import CardComponent from "./Card";

export default function Table() {
  const {
    bunchCards
  } = useGameContext();

  return (
    <div className="group flex flex-col m-5 items-center">
      <span className="text-white font-semibold">
        Table has: {bunchCards?.length} cards
      </span>
      <div className="flex flex-wrap gap-2">
        {bunchCards?.map((card, i) => (
          <CardComponent
            className={`translate-x-[${i}rem]`}
            key={`table-${card.toString}`}
            card={card}
          // onClick={() => retrieveCard(card)}
          />
        ))}
      </div>
    </div>
  );
}
