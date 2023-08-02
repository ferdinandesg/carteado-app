import { useContext } from "react";
import CardComponent from "../Card";
import Table from "../Table";
import { ModalContext } from "../Modal/ModalContext";
import { GameContext } from "@/contexts/game.context";
import { Card } from "@/models/Cards";
import ModalChoseCards from "../Modal/ChoseCards/ModalChoseCards";

export default function Game() {
    const { setShowModal, show } = useContext(ModalContext);
    const {
        isLoading,
        cardsPlayed,
        tableCards,
        playCard,
        drawTable,
        handlePickCards,
        handCards,
        endTurn
    } = useContext(GameContext)!;

    const notHiddenCards = tableCards.filter((x) => !x.hidden);
    const handleSelectHand = (hand: Card[]) => {
        handlePickCards(hand);
        setShowModal(false);
    };
    if (isLoading) return <div>Esperando jogadores...</div>
    return <>

        {show && (
            <ModalChoseCards
                handCards={notHiddenCards}
                selectHand={handleSelectHand}
            />
        )}
        <div className="flex flex-col m-auto p-3">
            <Table />
            <div className="flex flex-wrap gap-2 justify-center">
                {tableCards.map((card) => (
                    <CardComponent
                        card={card}
                        key={`player-table-${card.toString}`}
                    />
                ))}
            </div>
            <div className="flex justify-between w-1/4 mx-auto">
                <button
                    className="bg-gray-400 hover:bg-gray-400 transition mt-2 p-2 text-white"
                    onClick={drawTable}
                >
                    Buy table cards
                </button>
                <button onClick={() => endTurn()} className="bg-gray-400 hover:bg-gray-400 transition mt-2 p-2 text-white">
                    End Turn
                </button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
                {handCards.map((card) => (
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
}