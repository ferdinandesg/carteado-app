import CardComponent from "@/components/Card";
import Modal from "..";
import { useState } from "react";
import { Card } from "@/models/Cards";
import { Check } from "lucide-react";

import styles from "@styles/ModalChoseCards.module.scss";
import Separator from "@/components/Separator";
import { useGameContext } from "@/contexts/game.context";
interface ModalChoseCardsProps {
  isOpen: boolean;
}
export default function ModalChoseCards({
  isOpen
}: ModalChoseCardsProps) {
  const { handlePickCards, player } = useGameContext();
  const handCards = player?.hand || [];
  const [chosenCards, setChosenCards] = useState<Card[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  const pickHand = () => {
    if (chosenCards.length !== 3) return
    handlePickCards(chosenCards);
    setChosenCards([]);
    setLoading(true)

  }
  const selectCard = (card: Card) => {
    if (chosenCards.length < 3) setChosenCards((m) => [...m, card]);
  };

  const removeCard = (card: Card) =>
    setChosenCards((m) => [
      ...m.filter((x) => x.toString !== card.toString),
    ]);

  const cards = handCards.filter(h => h.hidden !== true);

  const notChosenCards = cards.filter(
    (x) => !chosenCards.some((y) => y.toString === x.toString)
  );
  if (!isOpen) return null;
  return (
    <Modal.Root>
      <Modal.Header title="Escolha de cartas" />
      <Modal.Content>
        <div className={styles.ModalChoseCards}>
          <div className={styles.notChosenCards}>
            {notChosenCards.map((card) => (
              <CardComponent
                card={card}
                key={`hand-${card.toString}`}
                onClick={() => selectCard(card)}
              />
            ))}
          </div>
          <Separator text="Selecione sua mão" />
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
          onClick={pickHand}
          icon={<Check color="white" />}
          disabled={isLoading || chosenCards.length < 3}
        />
      </Modal.Footer>
    </Modal.Root>
  );
}
