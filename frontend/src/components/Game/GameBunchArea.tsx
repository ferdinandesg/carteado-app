import CardBunch from "@/components/CardBunch";
import styles from "@/styles/Game.module.scss";
import { Card } from "shared/cards";

type GameBunchAreaProps = {
  cards: Card[];
  cardHeight?: number;
  canHover?: boolean;
  direction?: "left" | "right";
};

export default function GameBunchArea({
  cards,
  cardHeight = 180,
  canHover = false,
  direction,
}: GameBunchAreaProps) {
  return (
    <div className={styles.playedCards}>
      <CardBunch
        cards={cards}
        cardHeight={cardHeight}
        canHover={canHover}
        direction={direction}
      />
    </div>
  );
}
