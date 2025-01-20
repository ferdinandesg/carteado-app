import CardComponent from "../Card";
import Table from "../Table";
import ModalChoseCards from "../Modal/ChoseCards/ModalChoseCards";
import Players from "../Players";
import { useParams } from "next/navigation";
import { useGameContext } from "@/contexts/game.context";

export default function Game() {
  const { id } = useParams();

  const {
    player,
    handCards
  } = useGameContext();

  return (
    <>
      {player?.status === "chosing" && (
        <ModalChoseCards
          handCards={handCards}
          selectHand={() => {}}
        />
      )}
      <div className="flex flex-col m-auto p-3">
    
        <Table />
        <div className="flex flex-wrap gap-2 justify-center">
          {player?.table.map((card) => (
            <CardComponent card={card} key={`player-table-${card.toString}`} />
          ))}
        </div>
        <div className="flex justify-between w-1/4 mx-auto">
          <button
            className="bg-gray-400 hover:bg-gray-400 transition mt-2 p-2 text-white"
          >
            Buy table cards
          </button>
          <button
            className="bg-gray-400 hover:bg-gray-400 transition mt-2 p-2 text-white"
          >
            End Turn
          </button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {player?.hand.map((card) => (
            <CardComponent
              card={card}
              className="hover:-translate-y-3"
              key={`player-hand-${card.toString}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
