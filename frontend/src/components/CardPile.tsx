import classNames from "classnames";
import { Card } from "shared/cards";

import CardComponent, { AvailableSkins } from "./Card";
import { getCardKeys } from "@/lib/cards/cardKey";
import { type CardSize } from "@/lib/cards/cardSizing";
import { getPileTransform, type PileVariant } from "@/lib/cards/pileLayout";

import styles from "@/styles/CardPile.module.scss";

type CardPileProps = {
  cards: Card[];
  variant?: PileVariant;
  size?: CardSize;
  isHidden?: boolean;
  canHover?: boolean;
  onClick?: (card: Card) => void;
  /** Mostra só as últimas `maxVisible` cartas (pilhas grandes). */
  maxVisible?: number;
  /** Prefixo de `layoutId`; quando definido, as cartas animam ao entrar. */
  layoutPrefix?: string;
  skin?: AvailableSkins;
  className?: string;
  testId?: string;
};

/**
 * Pilha de cartas centralizada (sem `position: absolute`): todas as cartas
 * ocupam a mesma célula do grid e recebem deslocamentos determinísticos.
 */
export default function CardPile({
  cards,
  variant = "spread",
  size = "lg",
  isHidden = false,
  canHover = false,
  onClick,
  maxVisible,
  layoutPrefix,
  className,
  skin,
  testId,
}: CardPileProps) {
  const visible =
    maxVisible !== undefined && cards.length > maxVisible
      ? cards.slice(cards.length - maxVisible)
      : cards;
  const keys = getCardKeys(visible);

  return (
    <div
      className={classNames(styles.pile, styles[variant], className)}
      data-testid={testId}
      data-count={cards.length}>
      {visible.map((card, index) => {
        const { x, y, rotate } = getPileTransform(
          index,
          visible.length,
          variant
        );
        return (
          <div
            key={keys[index]}
            className={styles.item}
            style={
              {
                "--dx": `${x}%`,
                "--dy": `${y}%`,
                "--rot": `${rotate}deg`,
              } as React.CSSProperties
            }>
            <CardComponent
              card={card}
              size={size}
              skin={skin}
              isHidden={isHidden}
              canHover={canHover}
              layoutId={
                layoutPrefix ? `${layoutPrefix}-${keys[index]}` : undefined
              }
              onClick={onClick ? () => onClick(card) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
