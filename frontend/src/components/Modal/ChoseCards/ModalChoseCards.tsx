import CardComponent from "@/components/Card";
import Modal from "..";
import { useState } from "react";
import { Card } from "@/models/Cards";
import { Check } from "lucide-react";
interface ModalChoseCardsProps {
  handCards: Card[];
  selectHand: (hand: Card[]) => void;
}
export default function ModalChoseCards({
  handCards,
  selectHand,
}: ModalChoseCardsProps) {
  const [chosenCards, setChosenCards] = useState<Card[]>([]);
  const selectCard = (card: Card) => {
    if (chosenCards.length < 3) setChosenCards((m) => [...m, card]);
  };

  const removeCard = (card: Card) =>
    setChosenCards((m) => [
      ...m.filter((x) => x.toString !== card.toString),
    ]);

  return (
    <Modal.Root>
      <Modal.Header title="Escolha de cartas" />
      <Modal.Content>
        <div className="flex flex-col justify-between h-full items-center ">
          <div className="flex h-full w-full">
            {handCards
              .filter(
                (x) => !chosenCards.some((y) => y.toString === x.toString)
              )
              .map((card) => (
                <CardComponent
                  card={card}
                  key={`hand-${card.toString}`}
                  onClick={() => selectCard(card)}
                />
              ))}
          </div>
          <div className="flex items-center py-2 w-full">
            <div className=" h-px bg-gray-300 w-full"></div>
            <span className="text-center w-full text-gray-400 ">Selecione sua mão</span>
            <div className=" h-px bg-gray-300 w-full"></div>
          </div>
          <div className="flex h-full">
            {chosenCards.map((card) => (
              <CardComponent
                card={card}
                key={`chosen-${card.toString}`}
                onClick={() => removeCard(card)}
              />
            ))}
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer className="bg-white border-t">
        <Modal.Buttons
          className="bg-green-600"
          onClick={() => selectHand(chosenCards)}
          icon={<Check color="white" />}
          disabled={chosenCards.length < 3}
        />
      </Modal.Footer>
    </Modal.Root>
  );
}
