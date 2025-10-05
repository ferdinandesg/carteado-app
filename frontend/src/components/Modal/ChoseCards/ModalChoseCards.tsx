"use client";
import CardComponent from "@/components/Card";
import { useState } from "react";
import { Card } from "shared/cards";

import Separator from "@/components/Separator";

import styles from "@styles/ModalChoseCards.module.scss";
import { withSound } from "@/components/buttons/withSound";
import { useTranslation } from "react-i18next";
import { selectCurrentPlayer, useGameStore } from "@/contexts/game.store";
interface ModalChoseCardsProps {
  isOpen: boolean;
}

const ConfirmButton = withSound(
  ({ onClick, disabled, text }: { onClick: () => void; disabled: boolean, text: string }) => {
    return (
      <div className={styles.confirmButtonContainer}>
        <button
          onClick={onClick}
          disabled={disabled}
          className={styles.confirmButton}>
          {text}
        </button>
      </div>
    );
  },
  {}
);

export default function ModalChoseCards({ isOpen }: ModalChoseCardsProps) {
  const { t } = useTranslation()
  const { handlePickCards } = useGameStore();
  const player = useGameStore(selectCurrentPlayer);

  const handCards = player?.hand || [];
  const [chosenCards, setChosenCards] = useState<Card[]>([]);

  const pickHand = () => {
    if (chosenCards.length !== 3) return;
    handlePickCards(chosenCards);
    setChosenCards([]);
  };
  const selectCard = (card: Card) => {
    if (chosenCards.length < 3) setChosenCards((m) => [...m, card]);
  };
  const removeCard = (card: Card) =>
    setChosenCards((m) => [...m.filter((x) => x.toString !== card.toString)]);
  const cards = handCards.filter((h) => h.hidden !== true);
  const notChosenCards = cards.filter(
    (x) => !chosenCards.some((y) => y.toString === x.toString)
  );
  if (!isOpen) return null;

  return (
    <div className={styles.Overlay}>
      <div className={styles.ModalChoseCards}>
        <div className={styles.cards}>
          {notChosenCards.map((card) => (
            <CardComponent
              card={card}
              height={150}
              key={`hand-${card.toString}`}
              onClick={() => selectCard(card)}
            />
          ))}
        </div>
        <Separator text={(t("Game.choseYourHand"))} />
        <div className={styles.cards}>
          {chosenCards.map((card) => (
            <CardComponent
              height={150}
              card={card}
              key={`chosen-${card.toString}`}
              onClick={() => removeCard(card)}
            />
          ))}
        </div>
      </div>
      <ConfirmButton
        text={t("confirm")}
        onClick={pickHand}
        disabled={chosenCards.length !== 3}
      />
    </div>
  );
}
