import CardBunch from "@/components/CardBunch";
import { type CardSize } from "@/lib/cards/cardSizing";
import styles from "@/styles/Game.module.scss";
import { Card } from "shared/cards";

type GameBunchAreaProps = {
  cards: Card[];
  size?: CardSize;
  canHover?: boolean;
  direction?: "left" | "right";
};

export default function GameBunchArea({
  cards,
  size = "lg",
  canHover = false,
  direction,
}: GameBunchAreaProps) {
  return (
    <div className={styles.playedCards}>
      <CardBunch
        cards={cards}
        size={size}
        canHover={canHover}
        direction={direction}
      />
    </div>
  );
}
