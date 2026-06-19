import classNames from "classnames";
import { Card } from "shared/cards";

import { getCardDimensions, type CardSize } from "@/lib/cards/cardSizing";

import styles from "@/styles/CardBunch.module.scss";
import CardComponent from "./Card";
import { withSound } from "./buttons/withSound";

type CardBunchProps = {
  cards: Card[];
  onClick?: (card: Card) => void;
  size?: CardSize;
  cardHeight?: number;
  canHover?: boolean;
  direction?: "left" | "right";
  isHidden?: boolean;
  spacing?: "normal" | "compact";
};

const CardBunchWithSound = withSound(CardComponent, {
  clickSrc: "/assets/sfx/button-hover.mp3",
});

export default function CardBunch({
  cards,
  onClick = () => {},
  size = "lg",
  cardHeight,
  canHover = false,
  isHidden = false,
  direction = "right",
  spacing = "normal",
}: CardBunchProps) {
  const resolvedSize = cardHeight ? undefined : size;
  const { height, width } = getCardDimensions(resolvedSize ?? "lg", cardHeight);
  const cardSpacing = spacing === "compact" ? "6px" : "18px";

  return (
    <div className={styles.centerDeck}>
      <div className={styles.wrap}>
        {cards.map((card, index) => (
          <div
            key={card.toString}
            className={classNames(styles.card, styles[direction], {
              [styles.canHover]: canHover,
            })}
            style={
              {
                "--card-spacing": cardSpacing,
                "--i": index,
                "--card-width": `${width}px`,
              } as React.CSSProperties
            }>
            <CardBunchWithSound
              card={card}
              isHidden={isHidden}
              canHover={canHover}
              height={height}
              onClick={() => onClick(card)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
