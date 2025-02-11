import { useGameContext } from "@/contexts/game.context";
import styles from "@styles/Game.module.scss";
import CardFan from "../CardFan";
import Table from "../Table";
import TrucoActions from "./truco.actions";
import TrucoOpponent from "./truco.opponent";
import { useTranslation } from "react-i18next";
import CurrentBet from "./CurrentBet";
import Shaky from "../Shaky";

export default function TrucoGame() {
    const { t } = useTranslation();
    const { player, playCard, game } = useGameContext();
    const handCards = player?.hand || [];

    return <div className={styles.Game}>
        <div className={styles.TrucoHud}>
            <CurrentBet />
            <div className={styles.rounds}>
                <Shaky value={game?.rounds}>
                    {t("Truco.rounds", { rounds: game?.rounds })}
                </Shaky>
            </div>
            <div className={styles.teamPoints}>
                {game?.teams.map(t => (
                    <div key={t.id} className={styles.teamPoints}>
                        <Shaky value={t.roundPoints}>
                            {t.id}: {t.roundPoints} - {t.points}
                        </Shaky>
                    </div>
                ))}
            </div>
        </div>
        <div className={styles.gameTable}>
            <Table
                tableActions={
                    <TrucoActions />
                }
                OpponentComponent={TrucoOpponent}
            />
        </div>
        <CardFan
            cards={handCards.sort((a, b) => a.value - b.value)}
            onClick={playCard}
        />
    </div>
}