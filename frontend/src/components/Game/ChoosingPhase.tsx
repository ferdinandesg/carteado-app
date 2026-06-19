import CardComponent from "@/components/Card";
import Separator from "@/components/Separator";
import ActionButton from "@/components/buttons/ActionButton";
import { useGameStore } from "@/contexts/game.store";
import { useCurrentPlayer } from "@/hooks/game/useCurrentPlayer";
import { useCardSelection } from "@/hooks/useCardSelection";
import styles from "@/styles/ChoosingPhase.module.scss";
import { testIds } from "@/tests/testIds";
import { useTranslation } from "react-i18next";

export default function ChoosingPhase() {
  const { t } = useTranslation();
  const { handlePickCards } = useGameStore();
  const player = useCurrentPlayer();
  const initialHand = player?.hand?.filter((card) => !card.isHidden) ?? [];

  const {
    selectedCards,
    availableCards,
    toggleCard,
    isSelectionComplete,
    resetSelection,
  } = useCardSelection(initialHand, 3);

  const confirmHand = () => {
    if (!isSelectionComplete) return;
    handlePickCards(selectedCards);
    resetSelection();
  };

  return (
    <div
      className={styles.choosingPhaseContainer}
      data-testid={testIds.game.choosingPhase}>
      <div className={styles.cardArea}>
        {availableCards.map((card) => (
          <CardComponent
            card={card}
            size="md"
            canHover
            key={`available-${card.toString}`}
            onClick={() => toggleCard(card)}
          />
        ))}
      </div>

      <Separator text={t("Game.choseYourHand")} />

      <div className={styles.cardArea}>
        {selectedCards.map((card) => (
          <CardComponent
            size="md"
            card={card}
            key={`selected-${card.toString}`}
            onClick={() => toggleCard(card)}
          />
        ))}

        {Array.from({ length: 3 - selectedCards.length }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className={styles.cardPlaceholder}
          />
        ))}
      </div>

      <div className={styles.confirmButtonContainer}>
        <ActionButton
          onClick={confirmHand}
          disabled={!isSelectionComplete}
          data-testid={testIds.game.confirmHand}
          fullWidth>
          {t("confirm")}
        </ActionButton>
      </div>
    </div>
  );
}
