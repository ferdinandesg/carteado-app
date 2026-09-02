import classNames from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { Card } from "shared/cards";

import CardPile from "@/components/CardPile";

import styles from "@/styles/TrucoTable.module.scss";

type TrickPileProps = {
  cards: Card[];
  tricksWon: number;
  side: "ours" | "opponent";
  testId?: string;
};

/** Pilha de vazas ganhas por um time (slots 3 e 9). */
export default function TrickPile({
  cards,
  tricksWon,
  side,
  testId,
}: TrickPileProps) {
  return (
    <div
      className={classNames(styles.trickPile, styles[side])}
      data-testid={testId}
      data-tricks={tricksWon}>
      <AnimatePresence initial={false}>
        {cards.length > 0 && (
          <motion.div
            key="pile"
            className={styles.trickPileCards}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}>
            <CardPile
              cards={cards}
              variant="stack"
              size="sm"
              maxVisible={6}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <span className={styles.trickCount}>
        {Array.from({ length: 2 }).map((_, index) => (
          <span
            key={index}
            className={classNames(styles.trickDot, {
              [styles.trickDotOn]: index < tricksWon,
            })}
          />
        ))}
      </span>
    </div>
  );
}
