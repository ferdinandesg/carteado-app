import styles from "@/styles/Game.module.scss";
import CardFan from "../CardFan";
import CarteadoTable from "./carteado.table";
import { selectCurrentPlayer, useGameStore } from "@//contexts/game.store";

export default function PlayingPhase() {
    const { playCard } = useGameStore();
    const player = useGameStore(selectCurrentPlayer);
    const handCards = player?.hand || [];

    return <div className={styles.Game}>
        <CarteadoTable />
        <CardFan
            cards={handCards.sort((a, b) => a.value - b.value)}
            onClick={playCard}
        />
    </div>;
}