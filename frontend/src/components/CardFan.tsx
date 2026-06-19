import React, { useLayoutEffect, useRef, useState } from "react";
import { Card } from "shared/cards";

import CardComponent from "./Card";
import styles from "@styles/CardFan.module.scss";

const APPROX_CARD_WIDTH = 132;

type CardFanProps = {
  cards: Card[];
  onClick?: (card: Card) => void;
  spacing?: number;
  testId?: string;
};

export default function CardFan({
  cards,
  onClick = () => {},
  spacing: maxSpacing = 60,
  testId,
}: CardFanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [spacing, setSpacing] = useState(maxSpacing);
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
      const availableWidth = container.clientWidth - APPROX_CARD_WIDTH;
      const fitSpacing = Math.floor(availableWidth / Math.max(numCards - 1, 1));
      setSpacing(Math.min(maxSpacing, Math.max(28, fitSpacing)));
    };

    updateSpacing();
    const observer = new ResizeObserver(updateSpacing);
    observer.observe(container);
    return () => observer.disconnect();
  }, [maxSpacing, numCards]);

  return (
    <div
      ref={containerRef}
      className={styles.cardFanContainer}
      data-testid={testId}>
      {cards.map((card, index) => {
        const translateX = (initialOffset + index * spacing) / 5;

        const cardStyle = {
          "--translate-x": `${translateX}px`,
        } as React.CSSProperties;

        return (
          <div
            key={card.toString}
            className={styles.cardWrapper}
            style={cardStyle}
            onClick={() => onClick(card)}>
            <CardComponent
              card={card}
              height={180}
            />
          </div>
        );
      })}
    </div>
  );
}
