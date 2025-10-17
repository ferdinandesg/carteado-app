import CardComponent from "@//components/Card";
import Separator from "@//components/Separator";
import { withSound } from "@//components/buttons/withSound";
import { selectCurrentPlayer, useGameStore } from "@//contexts/game.store";
import { useTranslation } from "react-i18next";
import styles from "@/styles/ChoosingPhase.module.scss";
import { useCardSelection } from "@//hooks/useCardSelection";

const ConfirmButton = withSound(
    ({ onClick, disabled, text }: { onClick: () => void; disabled: boolean, text: string }) => {
        return (
            <div className={styles.confirmButtonContainer}>
                <button
                    onClick={onClick}
                    disabled={disabled}
                    className={styles.confirmButton}
                >
                    {text}
                </button>
            </div>
        );
    }, {}
);

export default function ChoosingPhase() {
    const { t } = useTranslation();
    const { handlePickCards } = useGameStore();
    const player = useGameStore(selectCurrentPlayer);

    const initialHand = player?.hand?.filter(h => !h.hidden) || [];

    const {
        selectedCards,
        availableCards,
        toggleCard,
        isSelectionComplete,
        resetSelection
    } = useCardSelection(initialHand, 3);

    const confirmHand = () => {
        if (!isSelectionComplete) return;
        handlePickCards(selectedCards);
        resetSelection(); // Limpa o estado local após o envio
    };

    return (
        <div className={styles.choosingPhaseContainer}>
            {/* 1. Área das cartas para escolher */}
            <div className={styles.cardArea}>
                {availableCards.map((card) => (
                    <CardComponent
                        card={card}
                        height={150}
                        key={`available-${card.toString}`}
                        onClick={() => toggleCard(card)}
                    />
                ))}
            </div>

            <Separator text={t("Game.choseYourHand")} />

            {/* 2. Área das cartas já escolhidas */}
            <div className={styles.cardArea}>
                {selectedCards.map((card) => (
                    <CardComponent
                        height={150}
                        card={card}
                        key={`selected-${card.toString}`}
                        onClick={() => toggleCard(card)} // Clicar aqui devolve a carta
                    />
                ))}

                {/* Placeholders para os espaços vazios */}
                {Array.from({ length: 3 - selectedCards.length }).map((_, index) => (
                    <div key={`placeholder-${index}`} className={styles.cardPlaceholder} />
                ))}
            </div>

            {/* 3. Botão de confirmação */}
            <ConfirmButton
                text={t("confirm")}
                onClick={confirmHand}
                disabled={!isSelectionComplete}
            />
        </div>
    );
}