import { Card } from "shared/cards";

import styles from "@styles/CardBunch.module.scss";
import CardComponent from "./Card";
import { withSound } from "./buttons/withSound";
interface CardBunchProps {
  cards: Card[];
  onClick?: (card: Card) => void;
  cardHeight?: number;
}

const CardBunchWithSound = withSound(CardComponent, {
  clickSrc: "/assets/sfx/button-hover.mp3",
});

export default function CardBunch({
  cards,
  onClick = () => { },
  cardHeight = 150,
}: CardBunchProps) {

  return (
    <div className={styles.centerDeck}>
      <div className={styles.wrap}>
        {cards.map((card, index) => {
          return (
            <div
              key={index}
              className={styles.card}>
              <CardBunchWithSound
                card={card}
                height={cardHeight}
                onClick={() => onClick(card)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
