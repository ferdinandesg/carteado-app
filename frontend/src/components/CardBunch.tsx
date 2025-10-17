import { Card } from "shared/cards";

import styles from "@styles/CardBunch.module.scss";
import CardComponent from "./Card";
import { withSound } from "./buttons/withSound";
import classNames from "classnames";
interface CardBunchProps {
  cards: Card[];
  onClick?: (card: Card) => void;
  cardHeight?: number;
  canHover?: boolean;
  direction?: "left" | "right";
}

const CardBunchWithSound = withSound(CardComponent, {
  clickSrc: "/assets/sfx/button-hover.mp3",
});

export default function CardBunch({
  cards,
  onClick = () => { },
  cardHeight = 150,
  canHover = false,
  direction = "right",
}: CardBunchProps) {
  console.log({ direction });
  return (
    <div className={styles.centerDeck}>
      <div className={styles.wrap}>
        {cards.map((card) => {
          return (
            <div
              key={card.toString}
              className={classNames(styles.card, styles[direction])}
            >
              <CardBunchWithSound
                card={card}
                canHover={canHover}
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
