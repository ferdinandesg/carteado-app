import { useGameStore } from "@//contexts/game.store";
import styles from "@/styles/Game.module.scss";
import Shaky from "../Shaky";
import CurrentBet from "./CurrentBet";
import { useTranslation } from "react-i18next";
import { useTypedGame } from "@/hooks/useTrucoGame";
import { isTrucoGame } from "shared/game";

export default function TrucoHud() {
    const { t } = useTranslation();
    const game = useTypedGame(isTrucoGame);

    return <div className={styles.TrucoHud}>
        <CurrentBet />
        <div className={styles.rounds}>
            <Shaky value={game?.rounds}>
                {t("Truco.rounds", { rounds: game?.rounds })}
            </Shaky>
        </div>
        <div className={styles.teamPoints}>
            {game?.teams.map(t => (
                <div key={t.id} className={styles.teamPoints}>
                    <Shaky value={t.roundWins}>
                        {t.id}: {t.roundWins} - {t.score}
                    </Shaky>
                </div>
            ))}
        </div>
    </div>
}