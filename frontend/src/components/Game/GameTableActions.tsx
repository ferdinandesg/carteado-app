import ActionButton from "@/components/buttons/ActionButton";
import { useGameStore } from "@/contexts/game.store";
import { testIds } from "@/tests/testIds";
import { useTranslation } from "react-i18next";

import GameActionPanel from "./GameActionPanel";

export default function GameTableActions() {
  const { t } = useTranslation();
  const { endTurn, pickUpBunch, game } = useGameStore();

  if (game?.status !== "playing") return null;

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
