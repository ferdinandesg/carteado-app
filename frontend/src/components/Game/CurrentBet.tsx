import styles from "@styles/Game.module.scss";
import { useTranslation } from "react-i18next";
import Shaky from "../Shaky";
import { useGameStore } from "@/contexts/game.store";

export default function CurrentBet() {
    const { t } = useTranslation();
    const { game } = useGameStore();

    return <div className={styles.currentBet}>
        {t("Truco.currentBet")}
        <Shaky value={game?.currentBet}>
            {game?.currentBet}
        </Shaky>
    </div>
}