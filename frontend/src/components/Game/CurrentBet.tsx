import styles from "@/styles/Game.module.scss";
import { useTranslation } from "react-i18next";
import Shaky from "../Shaky";
import { useGameStore } from "@//contexts/game.store";
import { useTypedGame } from "@/hooks/useTrucoGame";
import { isTrucoGame } from "shared/game";

export default function CurrentBet() {
    const { t } = useTranslation();
    const game = useTypedGame(isTrucoGame);

    return <div className={styles.currentBet}>
        {t("Truco.currentBet")}
        <Shaky value={game?.currentBet}>
            {game?.currentBet}
        </Shaky>
    </div>
}