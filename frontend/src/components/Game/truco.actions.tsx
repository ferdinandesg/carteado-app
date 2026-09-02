import classNames from "classnames";
import { useTranslation } from "react-i18next";

import ActionButton from "@/components/buttons/ActionButton";
import { useGameActions } from "@/hooks/game/useGameActions";
import { useTrucoActionsState } from "@/hooks/game/useTrucoActionsState";
import { testIds } from "@/tests/testIds";

import styles from "@/styles/Game.module.scss";
import GameActionPanel from "./GameActionPanel";

/** Slot 7: Aceitar / Correr (quando pendente) e Truco. */
export default function TrucoActions() {
  const { askTruco, rejectTruco, acceptTruco } = useGameActions();
  const { t } = useTranslation();
  const { canAcceptReject, canAskTruco } = useTrucoActionsState();

  return (
    <GameActionPanel layout="truco">
      <div
        className={classNames(styles.trucoActionsRow, {
          [styles.trucoActionsUrgent]: canAcceptReject,
        })}>
        <ActionButton
          onClick={acceptTruco}
          disabled={!canAcceptReject}
          data-testid={testIds.game.acceptTruco}
          size="md"
          fullWidth>
          {t("TableActions.accept")}
        </ActionButton>
        <ActionButton
          onClick={rejectTruco}
          disabled={!canAcceptReject}
          data-testid={testIds.game.rejectTruco}
          variant="secondary"
          size="md"
          fullWidth>
          {t("TableActions.reject")}
        </ActionButton>
      </div>
      <ActionButton
        onClick={askTruco}
        disabled={!canAskTruco}
        data-testid={testIds.game.askTruco}
        variant="accent"
        size="lg"
        className={styles.trucoButton}
        fullWidth>
        {t("TableActions.truco")}
      </ActionButton>
    </GameActionPanel>
  );
}
