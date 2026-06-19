import styles from "@/styles/Game.module.scss";
import { testIds } from "@/tests/testIds";

import CardFan from "../CardFan";
import CarteadoTable from "./carteado.table";
import { useGameStore } from "@/contexts/game.store";
import { usePlayerHand } from "@/hooks/game/usePlayerHand";

export default function PlayingPhase() {
  const { playCard } = useGameStore();
  const handCards = usePlayerHand();

  return (
    <div className={styles.Game}>
      <CarteadoTable />

      <div className={styles.handDock}>
        <CardFan
          cards={handCards}
          onClick={playCard}
          testId={testIds.game.cardFan}
        />
      </div>
    </div>
  );
}
