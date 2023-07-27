"use client";
import CardComponent from "@/components/Card";
import ModalChoseCards from "@/components/Modal/ChoseCards/ModalChoseCards";
import { ModalContext } from "@/components/Modal/ModalContext";
import Table from "@/components/Table";
import { GameContext } from "@/contexts/game.context";
import { PlayerCard } from "@/models/Cards";
import { useContext } from "react";

export default function Game() {
  const { setShowModal, show } = useContext(ModalContext);
  const { isLoading, tableCards, playCard, drawCard, setHandCards, handCards } =
    useContext(GameContext);

  if (isLoading) return <div>Loading...</div>;
  const notHiddenCards = tableCards.filter((x) => !x.hidden);
  const handleSelectHand = (hand: PlayerCard[]) => {
    setHandCards(hand);
    setShowModal(false);
  };

  return (
    <>
      {show && (
        <ModalChoseCards
          handCards={notHiddenCards}
          selectHand={handleSelectHand}
        />
      )}

      <div className="flex flex-col m-auto p-3">
        <Table />
        <div className="flex flex-wrap gap-2 justify-center">
          {tableCards
            .filter(
              (x) => !handCards.some((y) => y.toString() === x.toString())
            )
            .map((card) => (
              <CardComponent
                card={card}
                key={`player-hand-${card.toString()}`}
              />
            ))}
        </div>
        <button
          className="bg-gray-400 hover:bg-gray-400 transition mt-2 p-2 text-white"
          onClick={drawCard}
        >
          Draw a card
        </button>
        <div className="flex flex-wrap gap-2 justify-center mt-3">
        {handCards.map((card) => (
          <CardComponent
            card={card}
            className="hover:-translate-y-3"
            onClick={() => playCard!(card)}
            key={`player-hand-${card.toString()}`}
          />
        ))}
      </div>
      </div>
    </>
  );
}
