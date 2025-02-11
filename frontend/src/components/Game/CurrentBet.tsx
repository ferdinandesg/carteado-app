import styles from "@styles/Game.module.scss";
import { useTranslation } from "react-i18next";
import { useGameContext } from "@/contexts/game.context";
import Shaky from "../Shaky";

export default function CurrentBet() {
    const { t } = useTranslation();
    const { game } = useGameContext();

    return <div className={styles.currentBet}>
        {t("Truco.currentBet")}
        <Shaky value={game?.currentBet}>
            {game?.currentBet}
        </Shaky>
    </div>
}