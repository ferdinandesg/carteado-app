import { useGameContext } from "@/contexts/game.context";
import CardComponent from "../Card";
import styles from "@styles/Game.module.scss";
import CardFan from "../CardFan";
import Table from "../Table";
import TrucoActions from "./truco.actions";
import TrucoOpponent from "./truco.opponent";

export default function TrucoGame() {
    const { player, playCard, game } = useGameContext();
    const handCards = player?.hand || [];

    console.log({
        player, playCard, game
    })
    return <div className={styles.Game}>
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