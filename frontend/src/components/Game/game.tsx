import { useContext } from "react";
import CardComponent from "../Card";
import Table from "../Table";
import useModalContext from "../Modal/ModalContext";
import { useGameContext } from "@/contexts/game.context";
import { Card } from "@/models/Cards";
import ModalChoseCards from "../Modal/ChoseCards/ModalChoseCards";
import Players from "../Players";
import { useRoomContext } from "@/contexts/room.context";

export default function Game() {
  const { actualPlayer, handlePickCards, playCard, drawTable, endTurn } = useRoomContext();

  const notHiddenCards = actualPlayer!.table.filter((x) => !x.hidden);
  const handleSelectHand = (hand: Card[]) => handlePickCards(hand);
  return (
    <>
      {actualPlayer?.status === "choosing" && (
        <ModalChoseCards
          handCards={notHiddenCards}
          selectHand={handleSelectHand}
        />
      )}
      <div className="flex flex-col m-auto p-3">
        <Players />
        <Table />
        <div className="flex flex-wrap gap-2 justify-center">
          {actualPlayer?.table.map((card) => (
            <CardComponent card={card} key={`player-table-${card.toString}`} />
          ))}
        </div>
        <div className="flex justify-between w-1/4 mx-auto">
          <button
            className="bg-gray-400 hover:bg-gray-400 transition mt-2 p-2 text-white"
            onClick={drawTable}
          >
            Buy table cards
          </button>
          <button
            onClick={endTurn}
            className="bg-gray-400 hover:bg-gray-400 transition mt-2 p-2 text-white"
          >
            End Turn
          </button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {actualPlayer?.hand.map((card) => (
            <CardComponent
              card={card}
              className="hover:-translate-y-3"
              onClick={() => playCard(card)}
              key={`player-hand-${card.toString}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
