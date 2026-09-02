import CardPile from "@/components/CardPile";
import { useTypedGame } from "@/hooks/useTypedGame";
import styles from "@/styles/Game.module.scss";
import { isCarteadoGame } from "shared/game";

import { testIds } from "@/tests/testIds";

export default function CarteadoDeckArea() {
  const game = useTypedGame(isCarteadoGame);

  if (!game) return null;

  const deck = game.deck.cards;

  return (
    <div className={styles.tableDeckArea}>
      <div className={styles.deckItem}>
        <CardPile
          isHidden
          variant="stack"
          size="md"
          cards={deck}
          maxVisible={6}
        />
        <span
          className={styles.deckCount}
          data-testid={testIds.game.deckCount}>
          {deck.length}
        </span>
      </div>
    </div>
  );
}
