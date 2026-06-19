import { useLayoutEffect, useRef, useState } from "react";
import { Card } from "shared/cards";

import CardComponent from "./Card";
import {
  CARD_SIZES,
  getCardWidth,
  type CardSize,
} from "@/lib/cards/cardSizing";
import styles from "@styles/CardFan.module.scss";

type CardFanProps = {
  cards: Card[];
  onClick?: (card: Card) => void;
  size?: CardSize;
  spacing?: number;
  testId?: string;
};

export default function CardFan({
  cards,
  onClick = () => {},
  size = "xl",
  spacing: maxSpacing = 56,
  testId,
}: CardFanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [spacing, setSpacing] = useState(maxSpacing);
  const cardHeight = CARD_SIZES[size];
  const cardWidth = getCardWidth(cardHeight);
  const numCards = cards.length;
  const fanWidth = (numCards - 1) * spacing;
  const initialOffset = -fanWidth / 2;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || numCards <= 1) {
      setSpacing(maxSpacing);
      return;
    }

    const updateSpacing = () => {
      const availableWidth = container.clientWidth - cardWidth;
      const fitSpacing = Math.floor(availableWidth / Math.max(numCards - 1, 1));
      setSpacing(Math.min(maxSpacing, Math.max(24, fitSpacing)));
    };

    updateSpacing();
    const observer = new ResizeObserver(updateSpacing);
    observer.observe(container);
    return () => observer.disconnect();
  }, [cardWidth, maxSpacing, numCards]);

  return (
    <div
      ref={containerRef}
      className={styles.cardFanContainer}
      data-testid={testId}>
      {cards.map((card, index) => {
        const translateX = (initialOffset + index * spacing) / 5;

        return (
          <div
            key={card.toString}
            className={styles.cardWrapper}
            style={
              {
                "--translate-x": `${translateX}px`,
                "--card-width": `${cardWidth}px`,
              } as React.CSSProperties
            }
            onClick={() => onClick(card)}>
            <CardComponent
              card={card}
              size={size}
            />
          </div>
        );
      })}
    </div>
  );
}
