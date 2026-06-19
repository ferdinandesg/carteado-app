import styles from "@/styles/Game.module.scss";
import { testIds } from "@/tests/testIds";

import CardFan from "../CardFan";
import Table from "../Table";
import { useGameStore } from "@/contexts/game.store";
import { usePlayerHand } from "@/hooks/game/usePlayerHand";

import TrucoActions from "./truco.actions";
import TrucoBunchArea from "./TrucoBunchArea";
import TrucoDeckArea from "./TrucoDeckArea";
import TrucoHandResultsArea from "./TrucoHandResultsArea";
import TrucoHud from "./TrucoHud";

export default function TrucoGame() {
  const { playCard, game } = useGameStore();
  const playerHand = usePlayerHand();

  return (
    <div className={styles.Game}>
      <TrucoHud />

      <Table
        game={game}
        deckArea={<TrucoDeckArea />}
        playedCardsArea={<TrucoBunchArea />}
        actionsAreaLeft={<TrucoActions />}
        actionsAreaRight={<TrucoHandResultsArea />}
      />

      <div className={styles.handDock}>
        <CardFan
          cards={playerHand}
          onClick={playCard}
          testId={testIds.game.cardFan}
        />
      </div>
    </div>
  );
}
