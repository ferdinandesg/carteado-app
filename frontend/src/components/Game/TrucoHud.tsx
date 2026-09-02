import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { isTrucoGame } from "shared/game";

import Shaky from "../Shaky";
import { useGameStore } from "@/contexts/game.store";
import { useTypedGame } from "@/hooks/useTypedGame";
import { testIds } from "@/tests/testIds";

import styles from "@/styles/Game.module.scss";

/** Faixa única: placar (nós x eles) + rodada. A aposta vive no slot 1 da mesa. */
export default function TrucoHud() {
  const { t } = useTranslation();
  const game = useTypedGame(isTrucoGame);
  const userId = useGameStore((state) => state.userId);

  const myTeam = game?.teams.find((team) =>
    team.userIds.includes(userId ?? "-")
  );
  const ours = myTeam ?? game?.teams[0];
  const theirs = game?.teams.find((team) => team.id !== ours?.id);

  return (
    <header
      className={styles.gameHud}
      data-testid={testIds.game.trucoHud}>
      <div className={classNames(styles.hudTeam, styles.hudOurs)}>
        <span className={styles.hudLabel}>{t("Truco.us")}</span>
        <Shaky value={ours?.score}>
          <span className={styles.hudValue}>{ours?.score ?? 0}</span>
        </Shaky>
      </div>

      <div className={styles.hudRound}>
        <span className={styles.hudLabel}>{t("Truco.roundsLabel")}</span>
        <Shaky value={game?.rounds}>
          <span className={styles.hudRoundValue}>{game?.rounds ?? 0}</span>
        </Shaky>
      </div>

      <div className={classNames(styles.hudTeam, styles.hudTheirs)}>
        <span className={styles.hudLabel}>{t("Truco.them")}</span>
        <Shaky value={theirs?.score}>
          <span className={styles.hudValue}>{theirs?.score ?? 0}</span>
        </Shaky>
      </div>
    </header>
  );
}
