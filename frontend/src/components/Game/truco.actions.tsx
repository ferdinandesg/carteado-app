import ActionButton from "@/components/buttons/ActionButton";
import { useGameStore } from "@/contexts/game.store";
import { useTrucoActionsState } from "@/hooks/game/useTrucoActionsState";
import { testIds } from "@/tests/testIds";
import { useTranslation } from "react-i18next";

import styles from "@/styles/Game.module.scss";
import GameActionPanel from "./GameActionPanel";

export default function TrucoActions() {
  const { askTruco, rejectTruco, acceptTruco } = useGameStore();
  const { t } = useTranslation();
  const { canAcceptReject, canAskTruco } = useTrucoActionsState();

  return (
    <GameActionPanel layout="truco">
      <div className={styles.trucoActionsRow}>
        <ActionButton
          onClick={acceptTruco}
          disabled={!canAcceptReject}
          data-testid={testIds.game.acceptTruco}
          size="sm"
          fullWidth>
          {t("TableActions.accept")}
        </ActionButton>
        <ActionButton
          onClick={rejectTruco}
          disabled={!canAcceptReject}
          data-testid={testIds.game.rejectTruco}
          variant="secondary"
          size="sm"
          fullWidth>
          {t("TableActions.reject")}
        </ActionButton>
      </div>
      <ActionButton
        onClick={askTruco}
        disabled={!canAskTruco}
        data-testid={testIds.game.askTruco}
        variant="accent"
        size="sm"
        fullWidth>
        {t("TableActions.truco")}
      </ActionButton>
    </GameActionPanel>
  );
}
