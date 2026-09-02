import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { isTrucoGame } from "shared/game";

import Card from "@/components/Card";
import Shaky from "@/components/Shaky";
import { useTypedGame } from "@/hooks/useTypedGame";
import { testIds } from "@/tests/testIds";

import gameStyles from "@/styles/Game.module.scss";
import styles from "@/styles/TrucoTable.module.scss";

/** Slot 1: vira + chip da aposta atual. */
export default function TrucoDeckArea() {
  const { t } = useTranslation();
  const game = useTypedGame(isTrucoGame);

  if (!game) return null;

  return (
    <div className={styles.deckArea}>
      {game.vira && (
        <div className={gameStyles.deckItem}>
          <Card
            size="sm"
            card={game.vira}
          />
          <span className={gameStyles.deckLabel}>{t("Game.vira")}</span>
        </div>
      )}

      <Shaky value={game.currentBet}>
        <div
          className={classNames(styles.betChip, {
            [styles.pending]: game.trucoState === "PENDING",
            [styles.accepted]: game.trucoState === "ACCEPTED",
          })}
          data-testid={testIds.game.currentBet}>
          <span className={styles.betLabel}>{t("Truco.bet")}</span>
          <span className={styles.betValue}>{game.currentBet}</span>
        </div>
      </Shaky>
    </div>
  );
}
