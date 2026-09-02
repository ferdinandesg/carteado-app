import ActionButton from "@/components/buttons/ActionButton";
import { useGameStore } from "@/contexts/game.store";
import { useGameActions } from "@/hooks/game/useGameActions";
import { testIds } from "@/tests/testIds";
import { useTranslation } from "react-i18next";

import GameActionPanel from "./GameActionPanel";

export default function GameTableActions() {
  const { t } = useTranslation();
  const gameStatus = useGameStore((state) => state.game?.status);
  const { endTurn, pickUpBunch } = useGameActions();

  if (gameStatus !== "playing") return null;

  return (
    <GameActionPanel layout="column">
      <ActionButton
        variant="secondary"
        data-testid={testIds.game.pickUpBunch}
        onClick={pickUpBunch}
        size="sm"
        fullWidth>
        {t("TableActions.pickUpBunch")}
      </ActionButton>
      <ActionButton
        data-testid={testIds.game.endTurn}
        onClick={endTurn}
        size="sm"
        fullWidth>
        {t("TableActions.endTurn")}
      </ActionButton>
    </GameActionPanel>
  );
}
