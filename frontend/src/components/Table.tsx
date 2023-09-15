import { useGameContext } from "@/contexts/game.context";
import CardComponent from "./Card";
import { useRoomContext } from "@/contexts/room.context";

export default function Table() {
  const { bunch } = useRoomContext();

  return (
    <div className="group flex flex-col m-5 items-center">
      <span className="text-white font-semibold">
        Table has: {bunch?.length} cards
      </span>
      <div className="flex flex-wrap">
        {bunch?.map((card, i) => (
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
