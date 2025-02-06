import CardComponent from "../Card";
import Table from "../Table";
import ModalChoseCards from "../Modal/ChoseCards/ModalChoseCards";
import { useGameContext } from "@/contexts/game.context";

import styles from "@styles/Game.module.scss";
import CardFan from "../CardFan";
import ModalGameFinished from "../Modal/ModalGameFinished/ModalGameFinished";
import CarteadoTable from "./carteado.table";

export default function CarteadoGame() {
    const { player, playCard, game } = useGameContext();
    const handCards = player?.hand || [];
    const tableCards = player?.table.sort((a) => (a.hidden ? 1 : -1)) || [];

    const isPlayerChoosing = player?.status === "choosing";
    const isFinished = game?.status === "finished";

    return (
        <>
            <ModalChoseCards isOpen={isPlayerChoosing} />
            <ModalGameFinished isOpen={isFinished} />
            <div className={styles.Game}>
                <div className={styles.gameTable}>
                    {!isPlayerChoosing && <CarteadoTable />}
                </div>
                <CardFan
                    cards={handCards.sort((a, b) => a.value - b.value)}
                    onClick={playCard}
                />
                <div className={styles.cardTable}>
                    {tableCards.map((card) => (
                        <CardComponent
                            card={card}
                            height={125}
                            key={`player-table-${card.toString}`}
                            onClick={() => playCard(card)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
