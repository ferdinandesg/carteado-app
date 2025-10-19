import { Card } from "shared/cards";

import styles from "@/styles/CardBunch.module.scss";
import CardComponent from "./Card";
import { withSound } from "./buttons/withSound";
import classNames from "classnames";

interface CardBunchProps {
  cards: Card[];
  onClick?: (card: Card) => void;
  cardHeight?: number;
  // ✅ ALTERAÇÃO 1: Adicionar a largura do card como prop
  cardWidth?: number;
  canHover?: boolean;
  direction?: "left" | "right";
  isHidden?: boolean;
  spacing?: "normal" | "compact";
}

const CardBunchWithSound = withSound(CardComponent, {
  clickSrc: "/assets/sfx/button-hover.mp3",
});

export default function CardBunch({
  cards,
  onClick = () => { },
  cardHeight = 150,
  cardWidth = 100,
  canHover = false,
  isHidden = false,
  direction = "right",
  spacing = "normal",
}: CardBunchProps) {
  const cardSpacing = spacing === "compact" ? "5px" : "20px";

  return (
    <div className={styles.centerDeck}>
      <div className={styles.wrap}>
        {cards?.map((card, index) => {
          return (
            <div
              key={card.toString}
              className={classNames(styles.card, styles[direction], { [styles.canHover]: canHover })}
              style={
                {
                  "--card-spacing": cardSpacing,
                  "--i": index,
                  "--card-width": `${cardWidth}px`,
                } as React.CSSProperties
              }
            >
              <CardBunchWithSound
                card={card}
                isHidden={isHidden}
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