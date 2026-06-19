import CardBunch from "@/components/CardBunch";
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
        <CardBunch
          isHidden
          spacing="compact"
          cards={deck.slice(0, 10)}
          cardHeight={150}
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
