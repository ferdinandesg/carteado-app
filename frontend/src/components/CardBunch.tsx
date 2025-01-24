import { Card } from "shared/cards";

import styles from "@styles/CardBunch.module.scss";
import CardComponent from "./Card";
interface CardBunchProps {
  cards: Card[];
  onClick?: (card: Card) => void;
}
export default function CardBunch({
  cards,
  onClick = () => {},
}: CardBunchProps) {
  return (
    <div className={styles.centerDeck}>
      <div className={styles.wrap}>
        {cards.map((card, index) => {
          return (
            <div
              key={index}
              className={styles.card}>
              <CardComponent
                card={card}
                height={150}
                onClick={() => onClick(card)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
