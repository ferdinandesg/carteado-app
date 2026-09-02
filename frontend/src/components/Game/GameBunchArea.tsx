import CardPile from "@/components/CardPile";
import { type CardSize } from "@/lib/cards/cardSizing";
import { type PileVariant } from "@/lib/cards/pileLayout";
import styles from "@/styles/Game.module.scss";
import { Card } from "shared/cards";

type GameBunchAreaProps = {
  cards: Card[];
  size?: CardSize;
  canHover?: boolean;
  variant?: PileVariant;
  maxVisible?: number;
  testId?: string;
};

export default function GameBunchArea({
  cards,
  size = "lg",
  canHover = false,
  variant = "spread",
  maxVisible,
  testId,
}: GameBunchAreaProps) {
  return (
    <div className={styles.playedCards}>
      <CardPile
        cards={cards}
        size={size}
        canHover={canHover}
        variant={variant}
        maxVisible={maxVisible}
        testId={testId}
      />
    </div>
  );
}
