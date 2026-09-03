import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { isTrucoGame } from "shared/game";

import Card from "@/components/Card";
import PowerHint from "@/components/PowerHint";
import Shaky from "@/components/Shaky";
import { useTypedGame } from "@/hooks/useTypedGame";
import { testIds } from "@/tests/testIds";

import gameStyles from "@/styles/Game.module.scss";
import styles from "@/styles/TrucoTable.module.scss";

/** Slot 1: vira + chip da aposta + efeitos ativos da rodada. */
export default function TrucoDeckArea() {
  const { t } = useTranslation();
  const game = useTypedGame(isTrucoGame);

  if (!game) return null;

  const effects = game.activeEffects ?? [];

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

      {effects.length > 0 && (
        <ul
          className={styles.effects}
          data-testid={testIds.game.activeEffects}
          aria-label={t("Truco.activeEffects")}>
          {effects.map((effect) => (
            <li
              key={effect.id}
              className={classNames(
                styles.effectChip,
                styles[effect.powerId as keyof typeof styles]
              )}>
              <span className={styles.effectName}>
                {t(`Powers.${effect.powerId}.name`, {
                  defaultValue: effect.powerId,
                })}
              </span>
              <PowerHint
                powerId={effect.powerId}
                placement="below"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
