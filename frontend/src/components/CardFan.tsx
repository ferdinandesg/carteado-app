import { Card } from "shared/cards";

import styles from "@styles/CardFan.module.scss";
import CardComponent from "./Card";
interface CardFanProps {
  cards: Card[];
  onClick?: (card: Card) => void;
}

const CardFan: React.FC<CardFanProps> = ({ cards, onClick = () => {} }) => {
  return (
    <div className={styles.wrap}>
      {cards.map((card, index) => {
        return (
          <div
            key={index}
            className={styles.card}>
            <CardComponent
              card={card}
              onClick={() => onClick(card)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CardFan;
