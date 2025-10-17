import React from 'react';
import { Card } from 'shared/cards';
import CardComponent from './Card';
import styles from '@styles/CardFan.module.scss';

interface CardFanProps {
  cards: Card[];
  onClick?: (card: Card) => void;
  spacing?: number;
}

export default function CardFan({ cards, onClick = () => { }, spacing = 60 }: CardFanProps) {
  const numCards = cards.length;
  const fanWidth = (numCards - 1) * spacing;
  const initialOffset = -fanWidth / 2;

  return (
    <div
      className={styles.cardFanContainer}
    >
      {cards.map((card, index) => {
        const translateX = (initialOffset + index * spacing) / 5;

        const cardStyle = {
          '--translate-x': `${translateX}px`,
        } as React.CSSProperties;

        return (
          <div
            key={card.toString}
            className={styles.cardWrapper}
            style={cardStyle}
            onClick={() => onClick(card)}
          >
            <CardComponent card={card} height={180} />
          </div>
        );
      })}
    </div>
  );
}