import Shaky from "../Shaky";
import { useTranslation } from "react-i18next";
import { useTypedGame } from "@/hooks/useTypedGame";
import { isTrucoGame } from "shared/game";
import { testIds } from "@/tests/testIds";

import styles from "@/styles/Game.module.scss";

export default function TrucoHud() {
  const { t } = useTranslation();
  const game = useTypedGame(isTrucoGame);

  return (
    <header
      className={styles.gameHud}
      data-testid={testIds.game.trucoHud}>
      <div className={styles.hudStat}>
        <span className={styles.hudLabel}>{t("Truco.currentBet")}</span>
        <Shaky value={game?.currentBet}>
          <span className={styles.hudValue}>{game?.currentBet ?? 0}</span>
        </Shaky>
      </div>

      <div className={styles.hudStat}>
        <span className={styles.hudLabel}>{t("Truco.roundsLabel")}</span>
        <Shaky value={game?.rounds}>
          <span className={styles.hudValue}>
            {t("Truco.rounds", { rounds: game?.rounds ?? 0 })}
          </span>
        </Shaky>
      </div>

      <div className={styles.hudStat}>
        <span className={styles.hudLabel}>{t("Truco.scoreboard")}</span>
        <div className={styles.hudTeams}>
          {game?.teams.map((team) => (
            <Shaky
              key={team.id}
              value={team.score}>
              <span>
                {team.id}: {team.roundWins}-{team.score}
              </span>
            </Shaky>
          ))}
        </div>
      </div>
    </header>
  );
}
