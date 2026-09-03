import classNames from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Card } from "shared/cards";

import { AvailableSkins, CardSize } from "@/components/Card";
import CardPile from "@/components/CardPile";

import styles from "@/styles/TrucoTable.module.scss";

type TrickPileProps = {
  cards: Card[];
  tricksWon: number;
  side: "ours" | "opponent";
  skin?: AvailableSkins;
  testId?: string;
  size?: CardSize;
};

/**
 * Pilha de vazas ganhas por um time (slots 3 e 9). Hover abre o leque:
 * `fan-up` para a nossa pilha, `fan-down` para a adversária (ver
 * `pileLayout.ts`). Não trocar por `CardFan` — o leque da mão tem geometria
 * própria (arco + container query) e desalinha dentro do slot.
 */
export default function TrickPile({
  cards,
  tricksWon,
  side,
  size,
  skin,
  testId,
}: TrickPileProps) {
  const [expanded, setExpanded] = useState(false);
  const peek = expanded && cards.length > 0;

  return (
    <div
      className={classNames(styles.trickPile, styles[side], {
        [styles.peek]: peek,
        [styles.hasCards]: cards.length > 0,
      })}
      data-testid={testId}
      data-tricks={tricksWon}
      data-expanded={peek ? "true" : "false"}
      tabIndex={cards.length > 0 ? 0 : undefined}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}>
      <AnimatePresence initial={false}>
        {cards.length > 0 && (
          <motion.div
            key="pile"
            className={styles.trickPileCards}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: peek ? 1.12 : 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}>
            <CardPile
              skin={skin}
              cards={cards}
              variant={
                peek ? (side === "ours" ? "fan-up" : "fan-down") : "stack"
              }
              size={size ?? (peek ? "md" : "sm")}
              maxVisible={peek ? undefined : 6}
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
